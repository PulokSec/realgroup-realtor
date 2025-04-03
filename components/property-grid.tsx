"use client"

import { Loader } from "lucide-react"
import { PropertyCard } from "./property-card"

interface Property {
  properties: {
    id: string
    street_address: string
    city: string
    province: string
    price: string
    bedrooms_total: string
    bathroom_total: string
    type: string
    photo_url: string
    listing_id: string
    square_feet?: string
    year_built?: string
  }
}

interface PropertyGridProps {
  properties: Property[]
  loading: boolean
  sortBy: string
}

export function PropertyGrid({ properties, loading, sortBy }: PropertyGridProps) {
  // Sort properties based on selected sort option
  const sortedProperties = [...properties].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return Number(a.properties.price) - Number(b.properties.price)
      case "price-desc":
        return Number(b.properties.price) - Number(a.properties.price)
      case "newest":
        return new Date(b.properties.listing_id).getTime() - new Date(a.properties.listing_id).getTime()
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader className="h-8 w-8 animate-spin" />
          <p>Loading properties...</p>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h3 className="text-lg font-medium mb-2">No properties found</h3>
        <p className="text-muted-foreground">Try adjusting your search filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedProperties.map((property) => (
        <PropertyCard key={property.properties.id} property={property} />
      ))}
    </div>
  )
}

