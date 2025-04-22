"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, Share2, MapPin, Phone, Mail, ArrowLeft, ChevronLeft, ChevronRight, Lock } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { useAuth } from "@/components/auth/auth-context"

const DEFAULT_IMAGE = "/assets/call-image.jpg"

const ImageWithFallback = ({ src, alt, ...props }: { src: string; alt: string } & any) => {
  const [error, setError] = useState(false)
  
  return (
    <Image
      src={error || !src ? DEFAULT_IMAGE : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  )
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [similarProperties, setSimilarProperties] = useState<any[]>([])
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { isAuthenticated, setShowAuthModal } = useAuth()

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/properties/${id}`)
        if (!response.ok) throw new Error("Failed to fetch property")
        const data = await response.json()
        setProperty(data)
      } catch (error) {
        console.error("Error fetching property:", error)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProperty()
  }, [id])

  useEffect(() => {
    if (isAuthenticated && property) {
      fetchAdditionalImages()
      fetchSimilarProperties()
    }
  }, [isAuthenticated, property])

  const fetchAdditionalImages = () => {
    try {
      const photos = property?.properties?.all_photos
      const photosArray = photos ? Object.values(photos) : []
      setAdditionalImages(photosArray as string[])
      setImagesLoaded(true)
    } catch (error) {
      console.error("Error fetching additional images:", error)
      setAdditionalImages([DEFAULT_IMAGE])
    }
  }

  const fetchSimilarProperties = async () => {
    try {
      const response = await fetch(`/api/properties/similar?id=${id}`)
      if (response.ok) {
        const data = await response.json()
        setSimilarProperties(data)
      }
    } catch (error) {
      console.error("Error fetching similar properties:", error)
    }
  }

  const getGalleryImages = () => {
    if (isAuthenticated && imagesLoaded && additionalImages.length > 0) {
      return additionalImages
    }
    return [property?.properties?.photo_url || DEFAULT_IMAGE]
  }

  const galleryImages = getGalleryImages()

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!isAuthenticated && currentImageIndex === 0) {
      setShowAuthModal(true)
      return
    }
    setCurrentImageIndex(prev => 
      direction === 'prev' 
        ? prev === 0 ? galleryImages.length - 1 : prev - 1
        : prev === galleryImages.length - 1 ? 0 : prev + 1
    )
  }

  const handleThumbnailClick = (index: number) => {
    if (!isAuthenticated && index !== 0) {
      setShowAuthModal(true)
      return
    }
    setCurrentImageIndex(index)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 md:gap-8">
            {/* Skeleton loader remains same */}
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-4 md:py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <Button asChild>
              <Link href="/listings">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Listings
              </Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const { properties } = property
  const {
    photo_url,
    price,
    bedrooms_total,
    bathroom_total,
    street_address,
    city,
    province,
    postal_code,
    type,
    listing_id,
    sizeInterior,
    year_built,
    description,
    latitude,
    longitude,
    interiorFeatures,
    exteriorFeatures,
  } = properties

  const interiorFeaturesList: string[] = interiorFeatures || [
    `${bedrooms_total} Bedrooms`,
    `${bathroom_total} Bathrooms`,
    "Modern Kitchen",
    "Hardwood Floors",
  ]
  const exteriorFeaturesList: string[] = exteriorFeatures || [
    "Attached Garage",
    "Private Backyard",
    "Landscaped Garden",
  ]

  const square_feet = sizeInterior?.split(" ")[0] || null
  const mapUrl = latitude && longitude 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.005},${latitude-0.005},${longitude+0.005},${latitude+0.005}&layer=mapnik&marker=${latitude},${longitude}`
    : ""

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-4 md:py-8">
        {isMobile && (
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 md:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-lg">
              {!isAuthenticated && currentImageIndex === 0 && (
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end text-white p-6">
                  <Lock className="h-8 w-8 mb-2" />
                  <Button onClick={() => setShowAuthModal(true)} className="bg-primary hover:bg-primary/90">
                    Unlock All Photos
                  </Button>
                </div>
              )}

              <ImageWithFallback
                src={galleryImages[currentImageIndex]}
                alt={street_address}
                fill
                className="object-cover"
                priority
              />

              <div className="absolute inset-x-0 bottom-0 flex justify-between p-2">
                <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {galleryImages.length}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="icon"
                    className="rounded-full bg-black/60 hover:bg-black/80"
                    onClick={() => handleImageNavigation('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    className="rounded-full bg-black/60 hover:bg-black/80"
                    onClick={() => handleImageNavigation('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {!isMobile && (
              <div className="grid grid-cols-5 gap-2 md:gap-4">
                {galleryImages.slice(0, 10).map((img, index) => (
                  <div
                    key={index}
                    className={`relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer ${
                      index === currentImageIndex ? "ring-2 ring-primary" : ""
                    } ${!isAuthenticated && index !== 0 ? "opacity-50" : ""}`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    {!isAuthenticated && index !== 0 && (
                      <div className="absolute inset-0 z-10 bg-black/30 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <ImageWithFallback
                      src={img}
                      alt={`Property image ${index + 1}`}
                      fill
                      className="object-cover hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Mobile Header */}
            {isMobile && (
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">${Number(price).toLocaleString()}</h1>
                  <p className="text-sm mt-1">{street_address}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </div>
              </div>
            )}

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="p-4 border rounded-lg mt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{bedrooms_total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{bathroom_total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Square Feet</p>
                    <p className="font-medium">{square_feet || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="font-medium">{year_built || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-medium">{type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">MLS® Number</p>
                    <p className="font-medium">{listing_id}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground text-sm">
                    {description ||
                      `Beautiful ${bedrooms_total} bedroom, ${bathroom_total} bathroom ${type?.toLowerCase()} in ${city}. 
                      This property offers modern amenities and a great location. Contact us today to schedule a viewing!`}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="p-4 border rounded-lg mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Interior Features</h3>
                    <ul className="space-y-2 text-sm">
                      {interiorFeaturesList.map((feature:any, index:number) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Exterior Features</h3>
                    <ul className="space-y-2 text-sm">
                      {exteriorFeaturesList.map((feature:any, index:number) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="map" className="p-4 border rounded-lg mt-2">
                {mapUrl ? (
                  <iframe
                    width="100%"
                    height="450"
                    src={mapUrl}
                    className="border-0"
                  ></iframe>
                ) : (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                    <MapPin className="h-8 w-8 text-primary absolute inset-0 m-auto" />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4 md:space-y-6">
            {!isMobile && (
              <div>
                <h1 className="text-2xl font-base capitalize">{street_address}, {city},{province}-{postal_code}</h1>
                <p className="text-3xl font-bold">${Number(price).toLocaleString()}</p>
                <Button variant="outline" className="mt-4 w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Listing
                </Button>
              </div>
            )}

            <div className="border rounded-lg p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Contact Agent</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-16 w-16 overflow-hidden rounded-full">
                  <ImageWithFallback
                    src="/logo.png"
                    alt="Agent profile"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">Real Group Realtor®</p>
                  <p className="text-sm text-muted-foreground">Licensed Realtor®</p>
                </div>
              </div>
              <div className="space-y-3">
                <Button className="w-full bg-black">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Agent
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Agent
                </Button>
              </div>
            </div>

            {!isMobile && (
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Similar Properties</h3>
                <div className="space-y-4">
                  {similarProperties.map((prop, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="relative h-16 w-24 overflow-hidden rounded-lg">
                        <ImageWithFallback
                          src={prop?.properties?.photo_url}
                          alt={`Similar property ${i}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Link href={`/listings/${prop?.properties?.listing_id}`} className="flex-1">
                        <p className="font-medium">${Number(prop?.properties?.price).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {prop?.properties?.bedrooms_total} bed, {prop?.properties?.bathroom_total} bath
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t z-10">
            <Button className="w-full">Contact Agent</Button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}