"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Layers, X, MapPin, ChevronUp, ChevronDown, Loader } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Button } from "@/components/ui/button"
import { usePropertyStore } from "@/lib/store"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileFilters } from "@/components/mobile-filters"
import { MobileNavigation } from "@/components/mobile-navigation"
import { useAuth } from "@/components/auth/auth-context"
import { SiteHeader } from "@/components/site-header"
import { PropertyList } from "@/components/property-list"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

export function MobileMap() {
  const router = useRouter()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showNavigation, setShowNavigation] = useState(false)
  const [showList, setShowList] = useState(false)
  const [mapLoading, setMapLoading] = useState(false)
  const { isAuthenticated, setShowAuthModal } = useAuth()

  // Get properties from store
  const properties = usePropertyStore((state) => state.properties)
  const setSelectedPropertyInStore = usePropertyStore((state) => state.setSelectedProperty)
  const selectedPropertyInStore = usePropertyStore((state) => state.selectedProperty)
  const hoveredProperty = usePropertyStore((state) => state.hoveredProperty)
  const setHoveredProperty = usePropertyStore((state) => state.setHoveredProperty)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v9",
      center: [-106.67, 52.1332], // Default to Saskatoon
      zoom: 12,
      attributionControl: false,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right")

    // Add handlers for map movement
    map.current.on("moveend", updateVisibleProperties)
    map.current.on("zoomend", updateVisibleProperties)

    map.current.on("load", () => {
      map.current!.keyboard.enable()
      updateVisibleProperties()
    })

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
  }, [])

  // Update visible properties based on map bounds
  const updateVisibleProperties = async () => {
    if (!map.current) return

    setMapLoading(true)

    // Get the current map bounds
    const bounds = map.current.getBounds()

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
      setMapLoading(false)
    }
  }

  // Update markers when properties change
  useEffect(() => {
    if (!map.current) return

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
  }, [properties])

  // Handle property click
  const handlePropertyClick = (id: string) => {
    setSelectedPropertyInStore(id)

    // Find the property
    const property = properties.find((p) => p.properties.id === id)
    if (property) {
      setSelectedProperty(property)
    }
  }

  // Center map on selected property
  useEffect(() => {
    if (!map.current || !selectedPropertyInStore) return

    // Close all existing popups
    Object.values(markersRef.current).forEach((marker) => {
      const popup = marker.getPopup()
      popup && popup.remove()
    })

    const selectedProp = properties.find((p) => p.properties.id === selectedPropertyInStore)
    if (selectedProp) {
      map.current.flyTo({
        center: [selectedProp.geometry.coordinates[0], selectedProp.geometry.coordinates[1]],
        zoom: 15,
        essential: true,
      })

      // Open popup for selected property
      const marker = markersRef.current[selectedPropertyInStore]
      if (marker) {
        const popup = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([selectedProp.geometry.coordinates[0], selectedProp.geometry.coordinates[1]])
          .setHTML(`
            <div class="p-2">
              <img src="${selectedProp.properties.photo_url || "/placeholder.svg"}" alt="Property" class="w-full h-32 object-cover rounded mb-2" onerror="this.src='/placeholder.svg'; this.onerror=null;" />
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
  }, [selectedPropertyInStore, properties])

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

  const handleClosePropertyCard = () => {
    setSelectedProperty(null)
    setSelectedPropertyInStore(null)
  }

  const handleViewPropertyDetails = () => {
    if (selectedProperty) {
      router.push(`/listings/${selectedProperty.properties.listing_id}`)
    }
  }

  const handleSignIn = () => {
    setShowAuthModal(true)
  }

  const togglePropertyList = () => {
    setShowList(!showList)
  }

  return (
    <div className="relative h-screen w-full bg-gray-100">
      <SiteHeader />

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="absolute inset-0 top-16 bottom-16"
        style={{ bottom: showList ? "50%" : "16px" }}
      />

      {/* Top Navigation Bar */}
      <div className="absolute top-16 left-0 right-0 flex items-center justify-between p-2 bg-white/80 backdrop-blur-sm z-10">
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
        </div>
      </div>

      {/* Property List Toggle Button */}
      <Button
        variant="default"
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 rounded-full shadow-lg"
        onClick={togglePropertyList}
      >
        {showList ? (
          <>
            <ChevronDown className="h-4 w-4 mr-2" />
            Hide List
          </>
        ) : (
          <>
            <ChevronUp className="h-4 w-4 mr-2" />
            Show List
          </>
        )}
      </Button>

      {/* Property List Panel */}
      <div
        className={`absolute left-0 right-0 bottom-16 bg-white z-10 transition-transform duration-300 ease-in-out overflow-hidden ${
          showList ? "h-[50%]" : "h-0"
        }`}
      >
        <div className="h-full overflow-auto">
          <PropertyList isLoading={mapLoading} />
        </div>
      </div>

      {/* Property Card */}
      {selectedProperty && !showList && (
        <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-xl shadow-lg z-20 transition-transform duration-300 ease-in-out">
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
                  <p className="text-xs text-gray-500 mt-1">MLS® {selectedProperty.properties.listing_id}</p>
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
      <div className="absolute bottom-24 left-4 bg-white px-3 py-2 rounded-full shadow-md text-sm font-medium z-10">
        {properties.length} properties
      </div>

      {/* Loading Overlay */}
      {mapLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-30">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading properties...</p>
          </div>
        </div>
      )}
    </div>
  )
}

