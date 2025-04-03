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

export default function PropertyMap({ onLoadingChange }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [zoom] = useState(11);
  const properties = usePropertyStore((state) => state.properties)
  const setSelectedProperty = usePropertyStore((state) => state.setSelectedProperty)
  const selectedProperty = usePropertyStore((state) => state.selectedProperty)
  const hoveredProperty = usePropertyStore((state) => state.hoveredProperty)
  const [viewport, setViewport] = useState({
    bounds: null as mapboxgl.LngLatBounds | null,
    loading: false,
  })

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
    [properties],
  )

  const handlePropertyClick = useCallback(
    (id: string) => {
      setSelectedProperty(id)
    },
    [setSelectedProperty],
  )

  const updateVisibleProperties = useCallback(async () => {
    if (!map.current) return

    setViewport((prev) => ({ ...prev, loading: true }))
    if (onLoadingChange) onLoadingChange(true)

    // Get the current map bounds
    const bounds = map.current.getBounds()
    setViewport((prev) => ({ ...prev, bounds }))

    try {
      // Get the bounds coordinates
      const sw = bounds?.getSouthWest()
      const ne = bounds?.getNorthEast()

      // Fetch properties within these bounds from the API
      const response = await fetch(
        `/api/properties/bounds?swLng=${sw?.lng}&swLat=${sw?.lat}&neLng=${ne?.lng}&neLat=${ne?.lat}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch properties in bounds")
      }

      const data = await response.json()

      // Update visible properties in store
      usePropertyStore.setState({
        visibleProperties: data.features || [],
        totalVisibleCount: data.totalCount || 0,
      })
    } catch (error) {
      console.error("Error fetching properties in bounds:", error)

      // Fallback to client-side filtering if API fails
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

  // Center map on selected property
  useEffect(() => {
    if (!map.current || !selectedProperty) return

    const selectedProp = properties.find((p) => p.properties.id === selectedProperty)
    if (selectedProp) {
      map.current.flyTo({
        center: [selectedProp.geometry.coordinates[0], selectedProp.geometry.coordinates[1]],
        zoom: 15,
        essential: true,
      })

      // Open popup for selected property
      const marker = markersRef.current[selectedProperty]
      if (marker) {
        const popup = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([selectedProp.geometry.coordinates[0], selectedProp.geometry.coordinates[1]])
          .setHTML(`
           <div class="p-2">
             <img src="${selectedProp.properties.photo_url || "/assets/call-image.jpg"}" alt="Property" class="w-full h-32 object-cover rounded mb-2" onerror="this.src='/assets/call-image.jpg'; this.onerror=null;" />
             <div class="font-bold">$${Number(selectedProp.properties.price).toLocaleString()}</div>
             <div>${selectedProp.properties.bedrooms_total} bed, ${selectedProp.properties.bathroom_total} bath</div>
             <div class="truncate">${selectedProp.properties.street_address}</div>
             <div>${selectedProp.properties.type}</div>
             <a href="/listings/${selectedProp.properties.listing_id}" class="text-blue-500 hover:underline text-sm">View Details</a>
           </div>
         `)
          .addTo(map.current)

        // Store popup reference to close it later
        marker.setPopup(popup)
      }
    }
  }, [selectedProperty, properties])

  // Highlight hovered property on map
  useEffect(() => {
    if (!map.current) return

    // Reset all markers to default style
    Object.values(markersRef.current).forEach((marker) => {
      const el = marker.getElement()
      el.classList.remove("hovered-marker")
    })

    // Highlight hovered marker
    if (hoveredProperty && markersRef.current[hoveredProperty]) {
      const marker = markersRef.current[hoveredProperty]
      const el = marker.getElement()
      el.classList.add("hovered-marker")
    }
  }, [hoveredProperty])

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v9",
      center: [-122.8490, 49.1913], // Default to Surrey
      zoom: zoom,
      cooperativeGestures: true,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right")

    // Add handlers for map movement
    map.current.on("moveend", updateVisibleProperties)
    map.current.on("zoomend", updateVisibleProperties)

    // Initial load of properties
    map.current.on("load", updateVisibleProperties)

    // Add custom CSS for marker highlighting
    const style = document.createElement("style")
    style.textContent = `
     .hovered-marker {
       z-index: 10 !important;
       transform: scale(1.3) !important;
     }
     .marker {
       transition: transform 0.2s ease;
       cursor: pointer;
     }
     .marker-selected {
       z-index: 11 !important;
       transform: scale(1.4) !important;
     }
   `
    document.head.appendChild(style)

    return () => {
      map.current?.remove()
      document.head.removeChild(style)
    }
  }, [zoom, updateVisibleProperties])

  // Create individual markers for each property
  useEffect(() => {
    if (!map.current || !properties.length) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    // Create new markers
    properties.forEach((property) => {
      const { id, price } = property.properties
      const [lng, lat] = property.geometry.coordinates

      // Create custom marker element
      const el = document.createElement("div")
      el.className = "marker"
      el.innerHTML = `
       <div class="bg-primary text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
         $${Number(price).toLocaleString()}
       </div>
     `

      // Create marker
      const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current!)

      // Add click handler
      el.addEventListener("click", () => {
        handlePropertyClick(id)
      })

      // Store marker reference
      markersRef.current[id] = marker
    })
  }, [properties, handlePropertyClick])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {viewport.loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center gap-4">
          <Loader className="h-8 w-8 animate-spin" />
          <p>Please Wait...</p>
        </div>
      )}
    </div>
  )
}

