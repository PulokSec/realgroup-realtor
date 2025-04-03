"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Layers, X, Menu, MapPin } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Button } from "@/components/ui/button"
import { usePropertyStore } from "@/lib/store"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileFilters } from "@/components/mobile-filters"
import { MobileNavigation } from "@/components/mobile-navigation"
import { useAuth } from "@/components/auth/auth-context"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

export function MobileMap() {
  const router = useRouter()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showNavigation, setShowNavigation] = useState(false)
  const { isAuthenticated, setShowAuthModal } = useAuth()
  const properties = usePropertyStore((state) => state.visibleProperties || state.properties)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-106.67, 52.1332], // Default to Surrey
      zoom: 12,
      attributionControl: false,
    })

    map.current.on("load", () => {
      setMapLoaded(true)
      updateMarkers()
    })

    return () => {
      map.current?.remove()
    }
  }, [])

  // Update markers when properties change
  const updateMarkers = () => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    // Add new markers
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
        setSelectedProperty(property)

        // Center map on marker
        map.current?.flyTo({
          center: [lng, lat],
          zoom: 15,
          essential: true,
        })
      })

      // Store marker reference
      markersRef.current[id] = marker
    })
  }

  // Update markers when properties change
  useEffect(() => {
    updateMarkers()
  }, [properties, mapLoaded])

  const handleClosePropertyCard = () => {
    setSelectedProperty(null)
  }

  const handleViewPropertyDetails = () => {
    if (selectedProperty) {
      router.push(`/listings/${selectedProperty.properties.listing_id}`)
    }
  }

  const handleSignIn = () => {
    setShowAuthModal(true)
  }

  return (
    <div className="relative h-screen w-full bg-gray-100">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-2 bg-white/80 backdrop-blur-sm z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowFilters(true)}>
            <Search className="h-5 w-5" />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Layers className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-4">Map Layers</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Show Property Markers</span>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Show Schools</span>
                    <input type="checkbox" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Show Transit</span>
                    <input type="checkbox" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Show Amenities</span>
                    <input type="checkbox" className="toggle" />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" onClick={() => setShowNavigation(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Property Card */}
      {selectedProperty && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg z-20 transition-transform duration-300 ease-in-out">
          <div className="relative">
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white rounded-full shadow-md"
                onClick={handleClosePropertyCard}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative h-48 w-full">
              <img
                src={selectedProperty.properties.photo_url || "/placeholder.svg?height=400&width=600"}
                alt={selectedProperty.properties.street_address}
                className="w-full h-full object-cover"
              />

              {!isAuthenticated && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                  <p className="text-center mb-2 font-medium">Free Account Required</p>
                  <Button onClick={handleSignIn} className="bg-gray-900 hover:bg-gray-800 text-white">
                    Sign In to See All Photos <span className="ml-2 text-green-400">&raquo;</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">${Number(selectedProperty.properties.price).toLocaleString()}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{selectedProperty.properties.bedrooms_total} bd</span>
                    <span className="text-gray-300">|</span>
                    <span>{selectedProperty.properties.bathroom_total} ba</span>
                    <span className="text-gray-300">|</span>
                    <span>1100-1500 sqft</span>
                  </div>
                  <p className="text-sm mt-1">
                    {selectedProperty.properties.street_address}, {selectedProperty.properties.city}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">X12018833 • Re/max Realty Services Inc.</p>
                </div>
                <Button variant="ghost" size="icon" className="mt-1" onClick={handleViewPropertyDetails}>
                  <div className="rounded-full bg-gray-200 p-2">
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filters Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="left" className="w-[85vw] sm:w-[400px]">
          <MobileFilters onClose={() => setShowFilters(false)} />
        </SheetContent>
      </Sheet>

      {/* Mobile Navigation Sheet */}
      <Sheet open={showNavigation} onOpenChange={setShowNavigation}>
        <SheetContent side="right" className="w-[85vw] sm:w-[400px]">
          <MobileNavigation onClose={() => setShowNavigation(false)} />
        </SheetContent>
      </Sheet>

      {/* Current Location Button */}
      <Button
        variant="default"
        size="icon"
        className="absolute bottom-24 right-4 rounded-full shadow-lg bg-white text-black hover:bg-gray-100 z-10"
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              map.current?.flyTo({
                center: [position.coords.longitude, position.coords.latitude],
                zoom: 14,
                essential: true,
              })
            },
            (error) => {
              console.error("Error getting location:", error)
            },
          )
        }}
      >
        <MapPin className="h-5 w-5" />
      </Button>

      {/* Property Count Badge */}
      <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-full shadow-md text-sm font-medium z-10">
        {properties.length} properties
      </div>
    </div>
  )
}

