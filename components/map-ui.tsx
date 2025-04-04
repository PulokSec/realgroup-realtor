"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { usePropertyStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { List, Loader, Map, SlidersHorizontal, X } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useMemo, useRef, useState } from "react"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { PropertyListUi } from "./property-list-ui"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface MapUIProps {
  onLoadingChange?: (loading: boolean) => void
}

export function MapUI({ onLoadingChange }: MapUIProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [showList, setShowList] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: ''
  })
  const properties = usePropertyStore((state) => state.properties)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [viewport, setViewport] = useState({
    bounds: null as mapboxgl.LngLatBounds | null,
    loading: false,
  })

  // Filter properties
  const filteredProperties = useMemo(() => 
    properties.filter(property => {
      const price = Number(property.properties.price)
      const bedrooms = Number(property.properties.bedrooms_total)
      const bathrooms = Number(property.properties.bathroom_total)
      const type = property?.properties?.type?.toLowerCase()

      return (
        (filters.minPrice ? price >= Number(filters.minPrice) : true) &&
        (filters.maxPrice ? price <= Number(filters.maxPrice) : true) &&
        (filters.bedrooms ? bedrooms >= Number(filters.bedrooms) : true) &&
        (filters.bathrooms ? bathrooms >= Number(filters.bathrooms) : true) &&
        (filters.propertyType ? type === filters.propertyType.toLowerCase() : true)
      )
    }),
  [properties, filters])

  // Map initialization
  useEffect(() => {
    if (!mapContainer.current || (isMobile && showList)) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-122.849, 49.1913],
      zoom: 11,
      cooperativeGestures: true,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right")

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [isMobile, showList])

  // Update markers when filtered properties change
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // Add new markers
    filteredProperties.forEach(property => {
      const { id, price } = property.properties
      const [lng, lat] = property.geometry.coordinates

      const el = document.createElement("div")
      el.className = "marker"
      el.innerHTML = `
        <div class="bg-primary text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
          $${Number(price).toLocaleString()}
        </div>
      `

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map.current!)

      markersRef.current[id] = marker
    })
  }, [filteredProperties])

  // Mobile layout handling
  useEffect(() => {
    if (!isMobile) setShowList(false)
  }, [isMobile])

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="relative w-full h-full">
      {/* Mobile Header */}
      <div className={cn(
        "absolute top-0 left-0 right-0 z-10 p-4 bg-background/90 backdrop-blur-sm",
        "flex justify-between items-center border-b",
        !isMobile && "hidden"
      )}>
        {showList ? (
          <Button variant="ghost" onClick={() => setShowList(false)}>
            <Map className="h-4 w-4 mr-2" />
            Back to Map
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Filters</SheetTitle>
                    <Button 
                      variant="ghost" 
                      onClick={() => setFilters({
                        minPrice: '',
                        maxPrice: '',
                        bedrooms: '',
                        bathrooms: '',
                        propertyType: ''
                      })}
                    >
                      Clear All
                    </Button>
                  </SheetHeader>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={(e) => setFilters(prev => ({...prev, minPrice: e.target.value}))}
                        type="number"
                      />
                      <Input
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
                        type="number"
                      />
                    </div>
                    <Select 
                      value={filters.bedrooms} 
                      onValueChange={(v) => setFilters(prev => ({...prev, bedrooms: v}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Bedrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => 
                          <SelectItem key={n} value={`${n}`}>{n}+</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.bathrooms}
                      onValueChange={(v) => setFilters(prev => ({...prev, bathrooms: v}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Bathrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4].map(n => 
                          <SelectItem key={n} value={`${n}`}>{n}+</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.propertyType}
                      onValueChange={(v) => setFilters(prev => ({...prev, propertyType: v}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Property Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {['House', 'Apartment', 'Condo', 'Townhouse'].map(type => 
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </SheetContent>
              </Sheet>
              <div className="flex gap-2">
                {Object.entries(filters).map(([key, value]) => value && (
                  <Badge key={key} className="gap-1">
                    {key}: {value}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowList(true)}>
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </>
        )}
      </div>

      {/* Map Container */}
      <div className={cn(
        "w-full h-full",
        isMobile && showList && "hidden"
      )}>
        <div ref={mapContainer} className="w-full h-full" />
        {viewport.loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>

      {/* Mobile List View */}
      {isMobile && showList && (
        <div className="h-full pt-16">
          <PropertyListUi 
            properties={filteredProperties} 
            hideHeader 
            onBackToMap={() => setShowList(false)}
          />
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="absolute top-4 right-4 bottom-4 w-96 bg-background/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border flex flex-col">
          <div className="pb-4">
            <h2 className="text-lg font-semibold mb-4">{filteredProperties.length} Properties</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({...prev, minPrice: e.target.value}))}
                type="number"
              />
              <Input
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
                type="number"
              />
              <Select 
                value={filters.bedrooms} 
                onValueChange={(v) => setFilters(prev => ({...prev, bedrooms: v}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map(n => 
                    <SelectItem key={n} value={`${n}`}>{n}+</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Select
                value={filters.bathrooms}
                onValueChange={(v) => setFilters(prev => ({...prev, bathrooms: v}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4].map(n => 
                    <SelectItem key={n} value={`${n}`}>{n}+</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Select
                value={filters.propertyType}
                onValueChange={(v) => setFilters(prev => ({...prev, propertyType: v}))}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {['House', 'Apartment', 'Condo', 'Townhouse'].map(type => 
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <PropertyListUi properties={filteredProperties} />
        </div>
      )}
    </div>
  )
}