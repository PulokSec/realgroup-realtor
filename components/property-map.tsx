"use client"

import { usePropertyStore } from "@/lib/store"
import { Loader } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useCallback, useEffect, useRef, useState } from "react"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface PropertyMapProps {
  onLoadingChange?: (loading: boolean) => void
}

export default function PropertyMap({ onLoadingChange }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [zoom] = useState(11)

  const allProperties = usePropertyStore((state) => state.properties)
  const visibleProperties = usePropertyStore((state) => state.visibleProperties)
  const setSelectedProperty = usePropertyStore((state) => state.setSelectedProperty)
  const selectedProperty = usePropertyStore((state) => state.selectedProperty)
  const hoveredProperty = usePropertyStore((state) => state.hoveredProperty)

  const [viewport, setViewport] = useState({
    bounds: null as mapboxgl.LngLatBounds | null,
    loading: false,
  })

  const displayProperties = visibleProperties.length > 0 ? visibleProperties : allProperties

  const handlePropertyClick = useCallback(
    (id: string) => {
      setSelectedProperty(id)
    },
    [setSelectedProperty]
  )

  const updateVisibleProperties = useCallback(async () => {
    if (!map.current) return

    setViewport((prev) => ({ ...prev, loading: true }))
    onLoadingChange?.(true)

    const bounds = map.current.getBounds()
    setViewport((prev) => ({ ...prev, bounds }))

    try {
      if (!bounds) return
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()

      const response = await fetch(
        `/api/properties/bounds?swLng=${sw.lng}&swLat=${sw.lat}&neLng=${ne.lng}&neLat=${ne.lat}`
      )
      if (!response.ok) throw new Error("Failed to fetch properties in bounds")

      const data = await response.json()
      usePropertyStore.setState({
        visibleProperties: data.features || [],
        totalVisibleCount: data.totalCount || 0,
      })
    } catch {
      const inBounds = allProperties.filter((prop) => {
        const [lng, lat] = prop.geometry.coordinates
        return bounds && bounds.contains([lng, lat])
      })
      usePropertyStore.setState({
        visibleProperties: inBounds,
        totalVisibleCount: inBounds.length,
      })
    } finally {
      setViewport((prev) => ({ ...prev, loading: false }))
      onLoadingChange?.(false)
    }
  }, [allProperties, onLoadingChange])

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v9",
      center: [-122.849, 49.1913],
      zoom,
      cooperativeGestures: true,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right")

    // Only fetch on user interactions (drag and zoom), not programmatic flyTo
    map.current.on("dragend", updateVisibleProperties)
    map.current.on("zoomend", (e) => {
      // zoomend has originalEvent when user-initiated
      if ((e as any)?.originalEvent) {
        updateVisibleProperties()
      }
    })

    map.current.on("load", () => {
      map.current!.keyboard.enable()
      updateVisibleProperties()
    })

    const styleEl = document.createElement("style")
    styleEl.textContent = `
      .hovered-marker { z-index: 10 !important; transform: scale(1.3) !important; background-color: #0A75C2 !important; }
      .marker { transition: transform 0.2s ease; cursor: pointer; }
      .marker-selected { z-index: 11 !important; transform: scale(1.8) !important; }
    `
    document.head.appendChild(styleEl)

    return () => {
      map.current?.remove()
      document.head.removeChild(styleEl)
    }
  }, [zoom, updateVisibleProperties])

  useEffect(() => {
    if (!map.current) return

    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    displayProperties.forEach((property) => {
      const id = property.properties.id
      const [lng, lat] = property.geometry.coordinates
      const price = property.properties.price

      const el = document.createElement("div")
      el.className = "marker"
      el.innerHTML = `<div class=\"bg-[#6CAEDDFF] text-white px-2 py-1 rounded-full text-xs font-bold shadow-md w-4 h-4 border border-white border-1 hover:bg-primary\"></div>`

      const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current!) 
      el.addEventListener("click", () => handlePropertyClick(id))
      markersRef.current[id] = marker
    })
  }, [displayProperties, handlePropertyClick])

  useEffect(() => {
    if (!map.current || !selectedProperty) return

    Object.values(markersRef.current).forEach((m) => m.getPopup()?.remove())
    const prop = displayProperties.find((p) => p.properties.id === selectedProperty)
    if (!prop) return

    map.current.flyTo({
      center: prop.geometry.coordinates as [number, number],
      zoom: 15,
      essential: true,
    })

    const marker = markersRef.current[selectedProperty]
    if (marker) {
      const popup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(prop.geometry.coordinates as [number, number])
        .setHTML(
          `<div class=\"p-2\">
             <img src=\"${prop.properties.photo_url}\" alt=\"Property\" class=\"w-full h-32 object-cover rounded mb-2\" onerror=\"this.src='/assets/call-image.jpg'; this.onerror=null;\" />
             <div class=\"font-bold\">$${Number(prop.properties.price).toLocaleString()}</div>
             <div>${prop.properties.bedrooms_total} bed, ${prop.properties.bathroom_total} bath</div>
             <div class=\"truncate\">${prop.properties.street_address}</div>
             <div>${prop.properties.type}</div>
             <a href=\"/listings/${prop.properties.listing_id}\" class=\"text-blue-500 hover:underline text-sm\">View Details</a>
           </div>`
        )
        .addTo(map.current)
      marker.setPopup(popup)
    }
  }, [selectedProperty, displayProperties])

  useEffect(() => {
    if (!map.current) return

    Object.values(markersRef.current).forEach((marker) => {
      marker.getElement().classList.remove("hovered-marker", "marker-selected")
    })

    if (hoveredProperty && markersRef.current[hoveredProperty]) {
      markersRef.current[hoveredProperty].getElement().classList.add("hovered-marker")
    }
  }, [hoveredProperty])

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
