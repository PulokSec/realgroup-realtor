"use client"

import { usePropertyStore } from "@/lib/store"
import { EarthIcon, Loader } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "./ui/button"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface PropertyMapProps {
  onLoadingChange?: (loading: boolean) => void
}

export default function PropertyMap({ onLoadingChange }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [zoom] = useState(11)
  const [satMap, setSatMap] = useState(false)
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
    let mapStyle = satMap ? "mapbox://styles/mapbox/satellite-v9" : "mapbox://styles/mapbox/streets-v9";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-122.849, 49.1913],
      zoom,
      cooperativeGestures: true,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right")

    map.current.on("dragend", updateVisibleProperties)
    map.current.on("zoomend", (e) => {
      if ((e as any)?.originalEvent) {
        updateVisibleProperties()
      }
    })

    map.current.on("load", () => {
      map.current!.keyboard.enable()
      
      // Add GeoJSON source with clustering
      map.current!.addSource('properties', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: displayProperties.map((property) => ({
            ...property,
            geometry: {
              ...property.geometry,
              coordinates: [property.geometry.coordinates[0], property.geometry.coordinates[1]],
            },
          })),
        },
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
      })

      // Add cluster layers
      map.current!.addLayer({
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

      map.current!.addLayer({
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

      // Add individual property layer
      map.current!.addLayer({
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

      // Add hover layer
      map.current!.addLayer({
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

      // Add selected property layer
      map.current!.addLayer({
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

      // Cluster click handler
      map.current!.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        })
        const clusterId = features[0].properties!.cluster_id
        const source = map.current!.getSource('properties') as mapboxgl.GeoJSONSource

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return

          map.current!.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom ?? 11
          })
        })
      })

      // Individual property click handler
      map.current!.on('click', 'unclustered-point', (e) => {
        const feature = e.features![0]
        if (feature.properties) {
          handlePropertyClick(feature.properties.id)
        }
      })

      // Cursor styling
      map.current!.on('mouseenter', 'clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer'
      })
      map.current!.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = ''
      })

      updateVisibleProperties()
    })

    return () => {
      map.current?.remove()
    }
  }, [zoom, updateVisibleProperties, satMap])

  useEffect(() => {
    if (!map.current || !map.current.getSource('properties')) return

    const source = map.current.getSource('properties') as mapboxgl.GeoJSONSource
    source.setData({
      type: 'FeatureCollection',
      features: displayProperties.map((property) => ({
        ...property,
        geometry: {
          ...property.geometry,
          coordinates: [property.geometry.coordinates[0], property.geometry.coordinates[1]],
        },
      })),
    })
  }, [displayProperties])

  useEffect(() => {
    if (!map.current || !map.current.getLayer('selected-point')) return
    map.current.setFilter('selected-point', ['==', 'id', selectedProperty || ''])
  }, [selectedProperty])

  useEffect(() => {
    if (!map.current || !map.current.getLayer('hovered-point')) return
    map.current.setFilter('hovered-point', ['==', 'id', hoveredProperty || ''])
  }, [hoveredProperty])

  useEffect(() => {
    if (!map.current || !selectedProperty) return

    const prop = displayProperties.find((p) => p.properties.id === selectedProperty)
    if (!prop) return

    const popup = new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(prop.geometry.coordinates as [number, number])
      .setHTML(
        `<div class="p-2">
          <img src="${prop.properties.photo_url}" alt="Property" class="w-full h-32 object-cover rounded mb-2" onerror="this.src='/assets/call-image.jpg'; this.onerror=null;" />
          <div class="font-bold">$${Number(prop.properties.price).toLocaleString()}</div>
          <div>${prop.properties.bedrooms_total} bed, ${prop.properties.bathroom_total} bath</div>
          <div class="truncate">${prop.properties.street_address}</div>
          <div>${prop.properties.type}</div>
          <a href="/listings/${prop.properties.listing_id}" class="text-blue-500 hover:underline text-sm">View Details</a>
        </div>`
      )
      .addTo(map.current)

    return () => {
      popup.remove()
    }
  }, [selectedProperty, displayProperties])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {viewport.loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center gap-4">
          <Loader className="h-8 w-8 animate-spin" />
          <p>Please Wait...</p>
        </div>
      )}
      <div className="absolute top-4 right-4 z-10">
      <Button
          onClick={() => setSatMap((prev) => !prev)}
          className={`${satMap ? 'bg-white text-[#4CAF50]' : 'bg-[#000000] text-white'} border-1 border-black shadow-lg px-3 py-2 rounded-full text-sm font-medium hover:bg-[#FFC107]`}
        >
          <EarthIcon className="h-4 w-4 " />
        </Button>
          </div>
    </div>
  )
}