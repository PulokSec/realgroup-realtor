"use client"

import { MapFilters } from "@/components/map-filters"
import { MapUI } from "@/components/map-ui"
import MobilePropertyMap from "@/components/mobile-property-map"
import { PropertyList } from "@/components/property-list"
import { SiteHeader } from "@/components/site-header"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { useProperties } from "@/lib/hooks/use-properties"
import { usePropertyStore } from "@/lib/store"
import { Loader } from "lucide-react"
import dynamic from "next/dynamic"
import { useState } from "react"

// Dynamically import the map component to avoid SSR issues
const PropertyMap = dynamic(() => import("@/components/property-map"), {
  ssr: false,
  loading: () => <div>
    <Loader className="h-8 w-8 animate-spin" />
    <p>Loading properties...</p>
  </div>,
})

export default function MapSearchPage() {
  const { loading } = useProperties()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [mapLoading, setMapLoading] = useState(false)
  const [showList, setShowList] = useState(true)
  const visibleCount = usePropertyStore((state) => state.totalVisibleCount)
  // If on mobile, render the mobile map component
  if (isMobile) {
    return <MapUI />
  }

  // Otherwise, render the desktop version
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 relative">
        {/* Map Container */}
        <div className={`relative h-[calc(100vh-4rem)] ${showList ? "md:block" : "col-span-2"}`}>
          <PropertyMap onLoadingChange={setMapLoading} />
        </div>

        {/* Listings Container */}
        <div className={`h-[calc(100vh-4rem)] flex flex-col ${!showList ? "hidden md:flex" : ""}`}>
          <MapFilters />
          {/* Properties Count Badge */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className="bg-white px-3 py-2 rounded-full shadow-md text-sm font-medium">
              {visibleCount} properties in view
            </div>
          </div>
          <PropertyList isLoading={loading || mapLoading} />
        </div>
      </div>
    </div>
  )
}
