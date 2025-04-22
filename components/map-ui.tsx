"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { usePropertyStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { EarthIcon, List, Loader, Map, SlidersHorizontal, X } from "lucide-react"
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
  const popupRef = useRef<mapboxgl.Popup | null>(null)

  const allProps = usePropertyStore((s) => s.properties)
  const visibleProps = usePropertyStore((s) => s.visibleProperties)
  const setSelected = usePropertyStore((s) => s.setSelectedProperty)
  const selectedId = usePropertyStore((s) => s.selectedProperty)
  const hoveredProperty = usePropertyStore((s) => s.hoveredProperty)
  const properties = usePropertyStore((state) => state.properties)
  const [satMap, setSatMap] = useState(false)

  const [viewport, setViewport] = useState({ bounds: null as mapboxgl.LngLatBounds | null, loading: false })
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [showList, setShowList] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [filters, setFilters] = useState({ 
    minPrice: "", 
    maxPrice: "", 
    bedrooms: "", 
    bathrooms: "", 
    propertyType: "" 
  })

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

  // Map initialization with clustering
  useEffect(() => {
    if (map.current || !mapContainer.current || (isMobile && showList)) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: satMap ? "mapbox://styles/mapbox/satellite-v9" : "mapbox://styles/mapbox/streets-v9",
      center: [-122.849, 49.1913],
      zoom: 11,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
    
    map.current.on('load', () => {
      if (!map.current) return

      // Add cluster source
      map.current.addSource('properties', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: filtered.map((p) => ({
            ...p,
            geometry: {
              ...p.geometry,
              coordinates: [p.geometry.coordinates[0], p.geometry.coordinates[1]],
            },
          })),
        },
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14
      })

      // Cluster layers
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'properties',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#6CAEDD',   // Default color
            10,          // When point_count >= 10
            '#4CAF50',  // Green
            50,          // When point_count >= 50
            '#FFC107'    // Yellow
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10, 25,
            50, 30
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      })

      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'properties',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      })

      // Individual properties
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'properties',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#6CAEDD',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      })

      // Selected property layer
      map.current.addLayer({
        id: 'selected-point',
        type: 'circle',
        source: 'properties',
        filter: ['==', 'id', ''],
        paint: {
          'circle-color': '#0A75C2',
          'circle-radius': 16,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      })

      // Hover effect
      map.current.addLayer({
        id: 'hovered-point',
        type: 'circle',
        source: 'properties',
        filter: ['==', 'id', ''],
        paint: {
          'circle-color': '#0A75C2',
          'circle-radius': 12,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      })

      // Cluster interaction
      map.current.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        })
        const clusterId = features[0].properties!.cluster_id
        const source = map.current!.getSource('properties') as mapboxgl.GeoJSONSource

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return
          map.current!.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom ?? map.current!.getZoom()
          })
        })
      })

      // Property click handler
      map.current.on('click', 'unclustered-point', (e) => {
        const feature = e.features![0]
        if (feature.properties) {
          setSelected(feature.properties.id)
        }
      })

      // Cursor styling
      map.current.on('mouseenter', 'clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer'
      })
      map.current.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = ''
      })
      updateVisibleProperties()
    })

    map.current.on('moveend', updateVisibleProperties)
    map.current.on('zoomend', updateVisibleProperties)

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [isMobile, showList, updateVisibleProperties, satMap])

  // Update source data when filtered changes
  useEffect(() => {
    if (!map.current || !map.current.getSource('properties')) return

    const source = map.current.getSource('properties') as mapboxgl.GeoJSONSource
    source.setData({
      type: 'FeatureCollection',
      features: filtered.map((p) => ({
        ...p,
        geometry: {
          ...p.geometry,
          coordinates: [p.geometry.coordinates[0], p.geometry.coordinates[1]] as [number, number],
        },
      })),
    })
  }, [filtered])

  // Handle selected property popup
  useEffect(() => {
    if (!map.current || !selectedId) {
      popupRef.current?.remove()
      return
    }

    const prop = filtered.find(p => p.properties.id === selectedId)
    if (!prop) return

    popupRef.current?.remove()
    popupRef.current = new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(prop.geometry.coordinates as [number, number])
      .setHTML(`
        <div class="p-2">
          <img src="${prop.properties.photo_url}" alt="Property" 
               class="w-full h-32 object-cover rounded mb-2" 
               onerror="this.src='/assets/call-image.jpg'; this.onerror=null;" />
          <div class="font-bold">$${Number(prop.properties.price).toLocaleString()}</div>
          <div>${prop.properties.bedrooms_total} bed, ${prop.properties.bathroom_total} bath</div>
          <div class="truncate">${prop.properties.street_address}</div>
          <div>${prop.properties.type}</div>
          <a href="/listings/${prop.properties.listing_id}" 
             class="text-blue-500 hover:underline text-sm">View Details</a>
        </div>
      `)
      .addTo(map.current)

    map.current.setFilter('selected-point', ['==', 'id', selectedId])
  }, [selectedId, filtered])

  // Handle hover effects
  useEffect(() => {
    if (!map.current || !map.current.getLayer('hovered-point')) return
    map.current.setFilter('hovered-point', ['==', 'id', hoveredProperty || ''])
  }, [hoveredProperty])

  // Resize map on container visibility change
  useEffect(() => {
    if (map.current) map.current.resize()
  }, [isMobile, showList])

  // Close sheet on resize
  useEffect(() => { 
    if (!isMobile) setShowList(false) 
  }, [isMobile])

  const activeCount = Object.values(filters).filter(Boolean).length

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
                    Filters {activeCount > 0 ? `(${activeCount})` : ''}
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
      <div className={cn('w-full h-full', isMobile && showList && 'hidden')}>
        <div ref={mapContainer} className="w-full h-[90dvh]" />
        {viewport.loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
      <div className="absolute top-24 right-4 z-10">
      <Button
          onClick={() => setSatMap((prev) => !prev)}
          className={`${satMap ? 'bg-white text-[#4CAF50]' : 'bg-[#000000] text-white'} border-1 border-black shadow-lg px-3 py-2 rounded-full text-sm font-medium hover:bg-[#FFC107]`}
        >
          <EarthIcon className="h-4 w-4 " />
        </Button>
          </div>
      {/* Mobile List View */}
      {isMobile && showList && (
        <div className="h-full pt-16">
          <PropertyListUi 
            properties={filtered} 
            hideHeader={false} 
            onBackToMap={() => setShowList(false)}
          />
        </div>
      )}
    </div>
  )
}