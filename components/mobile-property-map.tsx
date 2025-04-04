"use client"

import { usePropertyStore } from "@/lib/store"
import { Loader } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface PropertyMapProps {
  onLoadingChange?: (loading: boolean) => void
}

export default function MobilePropertyMap({ onLoadingChange }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [zoom] = useState(11)
  const properties = usePropertyStore((state) => state.properties)
  const setSelectedProperty = usePropertyStore((state) => state.setSelectedProperty)
  const selectedProperty = usePropertyStore((state) => state.selectedProperty)
  const hoveredProperty = usePropertyStore((state) => state.hoveredProperty)
  const [viewport, setViewport] = useState({
    bounds: null as mapboxgl.LngLatBounds | null,
    loading: false,
  })
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: properties.map((property) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [property.geometry.coordinates[0], property.geometry.coordinates[1]],
        },
        properties: {
          id: property.properties.id,
          price: property.properties.price,
          bedrooms: property.properties.bedrooms_total,
          bathrooms: property.properties.bathroom_total,
          type: property.properties.type,
          photo_url: property.properties.photo_url,
          street_address: property.properties.street_address,
          listing_id: property.properties.listing_id,
        },
      })),
    }),
    [properties]
  )

  const handlePropertyClick = useCallback(
    (id: string) => {
      setSelectedProperty(id)
    },
    [setSelectedProperty]
  )

  const createPopup = useCallback(
    (property: any) => {
      return new mapboxgl.Popup({
        closeOnClick: false,
        maxWidth: isMobile ? "300px" : "400px",
        offset: isMobile ? [0, -30] : [0, -40],
      }).setHTML(`
        <div class="p-2">
          <img src="${property.properties.photo_url || "/assets/call-image.jpg"}" 
               alt="Property" 
               class="w-full ${isMobile ? "h-24" : "h-32"} object-cover rounded mb-2" 
               onerror="this.src='/assets/call-image.jpg'; this.onerror=null;" />
          <div class="font-bold text-sm md:text-base">
            $${Number(property.properties.price).toLocaleString()}
          </div>
          <div class="text-xs md:text-sm">
            ${property.properties.bedrooms_total} bed, 
            ${property.properties.bathroom_total} bath
          </div>
          <div class="truncate text-xs md:text-sm">${property.properties.street_address}</div>
          <div class="text-xs md:text-sm">${property.properties.type}</div>
          <a href="/listings/${property.properties.listing_id}" 
             class="inline-block mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs md:text-sm hover:bg-blue-600 transition-colors">
            View Details
          </a>
        </div>
      `)
    },
    [isMobile]
  )

  const updateVisibleProperties = useCallback(async () => {
    if (!map.current) return

    setViewport((prev) => ({ ...prev, loading: true }))
    if (onLoadingChange) onLoadingChange(true)

    const bounds = map.current.getBounds()
    setViewport((prev) => ({ ...prev, bounds }))

    try {
      const sw = bounds?.getSouthWest()
      const ne = bounds?.getNorthEast()

      const response = await fetch(
        `/api/properties/bounds?swLng=${sw?.lng}&swLat=${sw?.lat}&neLng=${ne?.lng}&neLat=${ne?.lat}`
      )

      if (!response.ok) throw new Error("Failed to fetch properties in bounds")

      const data = await response.json()

      usePropertyStore.setState({
        visibleProperties: data.features || [],
        totalVisibleCount: data.totalCount || 0,
      })
    } catch (error) {
      console.error("Error fetching properties in bounds:", error)
      const visibleProperties = properties.filter((property) => {
        const [lng, lat] = property.geometry.coordinates
        return bounds?.contains([lng, lat])
      })

      usePropertyStore.setState({
        visibleProperties,
        totalVisibleCount: visibleProperties.length,
      })
    } finally {
      setViewport((prev) => ({ ...prev, loading: false }))
      if (onLoadingChange) onLoadingChange(false)
    }
  }, [properties, onLoadingChange])

  // Selected property handling
  useEffect(() => {
    if (!map.current || !selectedProperty) return

    Object.values(markersRef.current).forEach((marker) => {
      const popup = marker.getPopup()
      popup && popup.remove()
    })

    const selectedProp = properties.find((p) => p.properties.id === selectedProperty)
    if (selectedProp) {
      map.current.flyTo({
        center: [selectedProp.geometry.coordinates[0], selectedProp.geometry.coordinates[1]],
        zoom: isMobile ? 14 : 15,
        essential: true,
      })

      const marker = markersRef.current[selectedProperty]
      if (marker) {
        const popup = createPopup(selectedProp)
        marker.setPopup(popup).togglePopup()
      }
    }
  }, [selectedProperty, properties, isMobile, createPopup])

  // Hover effect handling
  useEffect(() => {
    if (!map.current) return

    Object.values(markersRef.current).forEach((marker) => {
      const el = marker.getElement()
      el.classList.remove("hovered-marker")
    })

    if (hoveredProperty && markersRef.current[hoveredProperty]) {
      const marker = markersRef.current[hoveredProperty]
      const el = marker.getElement()
      el.classList.add("hovered-marker")
    }
  }, [hoveredProperty])

  // Map initialization
  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v9",
      center: [-122.849, 49.1913],
      zoom: zoom,
      cooperativeGestures: true,
    })

    map.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: !isMobile,
        showZoom: true,
        visualizePitch: !isMobile,
      }),
      "bottom-right"
    )

    if (isMobile) {
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        })
      )
    }

    map.current.on("moveend", updateVisibleProperties)
    map.current.on("zoomend", updateVisibleProperties)

    const style = document.createElement("style")
    style.textContent = `
      .hovered-marker {
        z-index: 10 !important;
        transform: scale(1.3) !important;
      }
      .marker {
        transition: transform 0.2s ease;
        cursor: pointer;
        will-change: transform;
      }
      .marker-selected {
        z-index: 11 !important;
        transform: scale(1.4) !important;
      }
      .mapboxgl-popup-content {
        border-radius: 0.75rem;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
      }
      .mapboxgl-popup-close-button {
        font-size: 1.125rem;
        padding: 0.25rem 0.75rem;
      }
      @media (min-width: 768px) {
        .mapboxgl-popup-content {
          max-width: 400px !important;
        }
      }
    `
    document.head.appendChild(style)

    map.current.on("load", () => {
      map.current!.keyboard.enable()
      updateVisibleProperties()
    })

    return () => {
      map.current?.remove()
      document.head.removeChild(style)
    }
  }, [zoom, updateVisibleProperties, isMobile])

  // Marker management
  useEffect(() => {
    if (!map.current || !properties.length) return

    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    properties.forEach((property) => {
      const { id, price } = property.properties
      const [lng, lat] = property.geometry.coordinates

      const el = document.createElement("div")
      el.className = "marker"
      el.innerHTML = `
        <div class="bg-primary text-white px-2 py-1 rounded-full text-xs md:text-sm font-bold shadow-md transition-transform">
          $${Number(price).toLocaleString()}
        </div>
      `

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map.current!)

      el.addEventListener("click", () => handlePropertyClick(id))
      el.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault()
          handlePropertyClick(id)
        },
        { passive: false }
      )

      markersRef.current[id] = marker
    })
  }, [properties, handlePropertyClick, isMobile])

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-[70vh] md:h-[600px] rounded-lg shadow-lg border"
      />
      {viewport.loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center gap-4 rounded-lg">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-gray-700">Loading properties...</p>
        </div>
      )}
    </div>
  )
}