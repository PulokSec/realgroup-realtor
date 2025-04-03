"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Share2, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "./auth/auth-context"
import type { Property } from "@/types/property"

interface PropertyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  property: Property
}

export function PropertyDetailModal({ isOpen, onClose, property }: PropertyDetailModalProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const { isAuthenticated, setShowAuthModal } = useAuth()

  const {
    photo_url,
    price,
    bedrooms_total,
    bathroom_total,
    street_address,
    city,
    province,
    type,
    listing_id,
    postal_code,
    id,
  } = property.properties

  // Fetch additional images when authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen && id) {
      fetchAdditionalImages()
    }
  }, [isAuthenticated, isOpen, id])

  const fetchAdditionalImages = async () => {
    try {
      const response = await fetch(`/api/properties/${id}/images`)
      if (response.ok) {
        const data = await response.json()
        setAdditionalImages(data.images)
        setImagesLoaded(true)
      }
    } catch (error) {
      console.error("Error fetching additional images:", error)
    }
  }

  // Get gallery images based on authentication status
  const getGalleryImages = () => {
    if (isAuthenticated && imagesLoaded && additionalImages.length > 0) {
      return [photo_url, ...additionalImages]
    }

    // Default placeholder image (just the main photo)
    return [photo_url || "/placeholder.svg?height=600&width=800&text=No%20Image"]
  }

  const galleryImages = getGalleryImages()

  const handleImageChange = (index: number) => {
    if (!isAuthenticated && index > 0) {
      setShowAuthModal(true)
      return
    }
    setCurrentImageIndex(index)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative aspect-4/3 overflow-hidden rounded-lg">
              {/* Lock overlay for non-authenticated users */}
              {!isAuthenticated && (
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end text-white p-6">
                  <Lock className="h-8 w-8 mb-2" />
                  <p className="text-center mb-2 font-medium">Sign in to view all property photos</p>
                  <Button onClick={() => setShowAuthModal(true)} className="bg-primary hover:bg-primary/90 text-white">
                    Unlock All Photos
                  </Button>
                </div>
              )}
              <Image
                src={galleryImages[currentImageIndex] || "/placeholder.svg"}
                alt={street_address}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.slice(0, 6).map((img, i) => (
                <div
                  key={i}
                  className={`relative aspect-4/3 overflow-hidden rounded-lg bg-muted cursor-pointer ${
                    i === currentImageIndex ? "ring-2 ring-primary" : ""
                  } ${!isAuthenticated && i > 0 ? "opacity-50" : ""}`}
                  onClick={() => handleImageChange(i)}
                >
                  {!isAuthenticated && i > 0 && (
                    <div className="absolute inset-0 z-10 bg-black/30 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <Image src={img || "/placeholder.svg"} alt={`Property photo ${i}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">${Number(price).toLocaleString()}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-lg">{street_address}</p>
              <p className="text-muted-foreground">
                {city}, {province} {postal_code}
              </p>
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary">{bedrooms_total} bed</Badge>
              <Badge variant="secondary">{bathroom_total} bath</Badge>
              <Badge variant="secondary">{type}</Badge>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Property Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Property Type</p>
                  <p>{type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">MLS® Number</p>
                  <p>{listing_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bedrooms</p>
                  <p>{bedrooms_total}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bathrooms</p>
                  <p>{bathroom_total}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground">
                Beautiful {bedrooms_total} bedroom, {bathroom_total} bathroom {type.toLowerCase()} in {city}. This
                property offers modern amenities and a great location.
              </p>
            </div>

            <Button className="w-full">Contact Agent</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

