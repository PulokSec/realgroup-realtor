"use client"

import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { usePropertyStore } from "@/lib/store"

interface PropertyCardProps {
  property: any // Replace with proper type
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const setHoveredProperty = usePropertyStore((state) => state.setHoveredProperty)
  const setSelectedProperty = usePropertyStore((state) => state.setSelectedProperty)
  const selectedProperty = usePropertyStore((state) => state.selectedProperty)

  const {
    id,
    photo_url,
    price,
    bedrooms_total,
    bathroom_total,
    street_address,
    city,
    province,
    type,
    listing_id,
    square_feet,
    created_at,
  } = property.properties
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state when photo_url changes
    setHasError(false);
  }, [photo_url]);
  // Generate a random time label if created_at is not available
  const timeAgo = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: false })
    : ["1 day", "22 hours", "2 days", "3 days", "New", "1 week"][Math.floor(Math.random() * 6)]

  const isSelected = selectedProperty === id

  return (
    <div
      className={`group md:w-full w-[400px] relative bg-white rounded-lg overflow-hidden border transition-all duration-200 ${isSelected ? "ring-2 ring-primary md:shadow-lg" : "hover:shadow-md"}`}
      onMouseEnter={() => setHoveredProperty(id)}
      onMouseLeave={() => setHoveredProperty(null)}
      onClick={() => setSelectedProperty(id)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted-foreground/20"></div>
          </div>
        )}
        <Image
  src={hasError || !photo_url ? "/assets/call-image.jpg" : photo_url}
  alt={street_address}
  fill
  className={`object-cover transition-transform ${
    isImageLoading ? "opacity-0" : "opacity-100"
  }`}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  onLoad={() => setIsImageLoading(false)}
  onError={() => {
    setIsImageLoading(false);
    setHasError(true);
  }}
/>
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className="bg-green-500 text-white hover:bg-green-600">For Sale</Badge>
          <Badge variant="secondary" className="bg-black/70 text-white hover:bg-black/80">
            {timeAgo}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      </div>
      <div className="p-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl font-bold">${Number(price).toLocaleString()}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {bedrooms_total} bed • {bathroom_total} bath • {square_feet ? `${square_feet} sqft` : type}
        </p>
        <p className="mt-1 text-sm truncate">{street_address}</p>
        <p className="text-sm text-muted-foreground truncate">
          {city}, {province}
        </p>
        <p className="text-xs text-muted-foreground mt-2">MLS® {listing_id}</p>
      </div>
      <Link href={`/listings/${listing_id}`} className="absolute inset-0">
        <span className="sr-only">View property details</span>
      </Link>
    </div>
  )
}

