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
import { useCallback, useEffect, useRef, useState, useMemo } from "react"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { PropertyListUi } from "./property-list-ui"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface MapUIProps {
  onLoadingChange?: (loading: boolean) => void
}

export function MapUI({ onLoadingChange }: MapUIProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({})

  const allProps = usePropertyStore((s) => s.properties)
  const visibleProps = usePropertyStore((s) => s.visibleProperties)
  const setSelected = usePropertyStore((s) => s.setSelectedProperty)
  const selectedId = usePropertyStore((s) => s.selectedProperty)
  const properties = usePropertyStore((state) => state.properties)

  const [viewport, setViewport] = useState({ bounds: null as mapboxgl.LngLatBounds | null, loading: false })
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [showList, setShowList] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", bedrooms: "", bathrooms: "", propertyType: "" })

  const dataSource = visibleProps.length > 0 ? visibleProps : allProps
  const filtered = useMemo(
    () => dataSource.filter((p) => {
      const price = Number(p.properties.price)
      const beds = Number(p.properties.bedrooms_total)
      const baths = Number(p.properties.bathroom_total)
      const type = p.properties.type?.toLowerCase() || ""
      return (
        (!filters.minPrice || price >= Number(filters.minPrice)) &&
        (!filters.maxPrice || price <= Number(filters.maxPrice)) &&
        (!filters.bedrooms || beds >= Number(filters.bedrooms)) &&
        (!filters.bathrooms || baths >= Number(filters.bathrooms)) &&
        (!filters.propertyType || type === filters.propertyType.toLowerCase())
      )
    }),
    [dataSource, filters]
  )

  const updateVisibleProperties = useCallback(async () => {
    if (!map.current) return

    setViewport((prev) => ({ ...prev, loading: true }))
    onLoadingChange?.(true)

    const bounds = map.current.getBounds()
    setViewport((prev) => ({ ...prev, bounds }))

    try {
      const response = await fetch(
        bounds
          ? `/api/properties/bounds?swLng=${bounds.getSouthWest().lng}&swLat=${bounds.getSouthWest().lat}&neLng=${bounds.getNorthEast().lng}&neLat=${bounds.getNorthEast().lat}`
          : ""
      )

      if (!response.ok) throw new Error("Failed to fetch properties in bounds")
      const data = await response.json()

      usePropertyStore.setState({ visibleProperties: data.features || [], totalVisibleCount: data.totalCount || 0 })
    } catch (error) {
      console.error("Error fetching properties in bounds:", error)
      const vis = properties.filter((prop) => {
        const [lng, lat] = prop.geometry.coordinates
        return bounds && bounds.contains([lng, lat])
      })
      usePropertyStore.setState({ visibleProperties: vis, totalVisibleCount: vis.length })
    } finally {
      setViewport((prev) => ({ ...prev, loading: false }))
      onLoadingChange?.(false)
    }
  }, [properties, onLoadingChange])

  // Initialize map once
  useEffect(() => {
    if (map.current || !mapContainer.current || (isMobile && showList)) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v9",
      center: [-122.849, 49.1913],
      zoom: 11,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
    map.current.on('moveend', updateVisibleProperties)
    map.current.on('zoomend', updateVisibleProperties)
    map.current.on('load', updateVisibleProperties)

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [isMobile, showList, updateVisibleProperties])

  // Resize map on container visibility change
  useEffect(() => {
    if (map.current) map.current.resize()
  }, [isMobile, showList])

  // Render markers & popups
  useEffect(() => {
    if (!map.current) return

    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    filtered.forEach((p) => {
      const id = p.properties.id
      const [lng, lat] = p.geometry.coordinates
      const el = document.createElement('div')
      el.className = 'marker'
      el.innerHTML = `<div class=\"bg-[#6CAEDDFF] text-white px-2 py-1 rounded-full text-xs font-bold shadow-md w-4 h-4 border border-white border-1 hover:bg-primary\"></div>`

      const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current!)      
      el.onclick = () => setSelected(id)
      if (id === selectedId) el.classList.add('marker-selected')
      markersRef.current[id] = marker
    })
  }, [filtered, selectedId, setSelected])

  // Close sheet on resize
  useEffect(() => { if (!isMobile) setShowList(false) }, [isMobile])

  const activeCount = Object.values(filters).filter(Boolean).length

    // Helper to render filter inputs
    const FilterForm = () => (
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
          <Input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
        </div>
        <Select value={filters.bedrooms} onValueChange={(v) => setFilters(f => ({ ...f, bedrooms: v })) }>
          <SelectTrigger><SelectValue placeholder="Bedrooms" /></SelectTrigger>
          <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()}>{n}+</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filters.bathrooms} onValueChange={(v) => setFilters(f => ({ ...f, bathrooms: v })) }>
          <SelectTrigger><SelectValue placeholder="Bathrooms" /></SelectTrigger>
          <SelectContent>{[1,2,3,4].map(n => <SelectItem key={n} value={n.toString()}>{n}+</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filters.propertyType} onValueChange={(v) => setFilters(f => ({ ...f, propertyType: v })) }>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>{['House','Apartment','Condo','Townhouse'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="ghost" onClick={() => setFilters({ minPrice:'', maxPrice:'', bedrooms:'', bathrooms:'', propertyType:'' })}>Clear All</Button>
      </div>
    )

  return (
    <div className="relative w-full h-screen">        
      <div className={cn('absolute top-0 left-0 right-0 z-10 p-4 bg-background/90 backdrop-blur-sm flex justify-between items-center border-b', !isMobile && 'hidden')}>
      {showList ? (
          <Button variant="ghost" onClick={() => setShowList(false)}>
            <Map className="h-4 w-4" />
            Back to Map
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters {activeCount>0?(`${activeCount}`):''}
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

      {/* Map */}
      <div className={cn('w-full h-full', isMobile && showList && 'hidden')}>
        <div ref={mapContainer} className="w-full h-full" />
        {viewport.loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>

            {/* List */}
            {isMobile && showList && <div className="h-full pt-16"><PropertyListUi properties={filtered} hideHeader={false} onBackToMap={() => setShowList(false)}/></div>}

    </div>
  )
}

// Removed incorrect custom useMemo implementation
