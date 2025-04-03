"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Search, ChevronLeft, ChevronRight, Heart, Loader } from "lucide-react"

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
  }
}

export default function OurListingsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [itemsPerPage] = useState(12)
  const [priceRange, setPriceRange] = useState("all")
  const [propertyType, setPropertyType] = useState("all")
  const [bedrooms, setBedrooms] = useState("all")

  const fetchProperties = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      params.append("limit", itemsPerPage.toString())

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-")
        if (min) params.append("minPrice", min)
        if (max) params.append("maxPrice", max)
      }

      if (propertyType !== "all") {
        params.append("type", propertyType)
      }

      if (bedrooms !== "all") {
        params.append("bedrooms", bedrooms)
      }

      const response = await fetch(`/api/properties?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch properties")
      }

      const data = await response.json()
      setProperties(data.features || [])
      setTotalResults(data.totalCount || data.features.length)
      setTotalPages(Math.ceil((data.totalCount || data.features.length) / itemsPerPage))
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [currentPage, priceRange, propertyType, bedrooms])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProperties()
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Our Listings</h1>
          <p className="text-muted-foreground">
            Browse our exclusive property listings in Surrey and surrounding areas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Filters */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="search"
                        placeholder="Address, city, postal code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button type="submit" size="icon" className=" bg-black">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range</label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Price</SelectItem>
                        <SelectItem value="0-300000">Under $300,000</SelectItem>
                        <SelectItem value="300000-500000">$300,000 - $500,000</SelectItem>
                        <SelectItem value="500000-750000">$500,000 - $750,000</SelectItem>
                        <SelectItem value="750000-1000000">$750,000 - $1,000,000</SelectItem>
                        <SelectItem value="1000000-">$1,000,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Property Type</label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Condo">Condo</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <Select value={bedrooms} onValueChange={setBedrooms}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bedrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full bg-black">
                    Apply Filters
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Not sure where to start? Contact me for personalized assistance with your property search.
                </p>
                <Button className="w-full bg-black">Contact Real Group</Button>
              </CardContent>
            </Card>
          </div>

          {/* Listings */}
          <div>
            {/* Results count */}
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {loading ? "Loading properties..." : `${totalResults} homes for sale`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {totalResults > 0
                  ? `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, totalResults)} of ${totalResults}`
                  : "No results"}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64 gap-4">
                <Loader className="h-8 w-8 animate-spin" />
                <p>Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <h3 className="text-lg font-medium mb-2">No properties found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters to see more results</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {properties.map((property) => {
    // Create a component wrapper for better state management
    const PropertyCard = ({ property }: { property: Property }) => {
      const [hasError, setHasError] = useState(false);
      const [isImageLoading, setIsImageLoading] = useState(true);

      useEffect(() => {
        // Reset states when property changes
        setHasError(false);
        setIsImageLoading(true);
      }, [property.properties.photo_url]);

      return (
        <Card className="overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src={hasError || !property.properties.photo_url 
                ? "/assets/call-image.jpg" 
                : property.properties.photo_url}
              alt={property.properties.street_address || "Property image"}
              fill
              className={`object-cover ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setIsImageLoading(false);
                setHasError(true);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Badge className="absolute top-2 left-2">For Sale</Badge>
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium truncate">
              {property.properties.street_address}
            </h3>
            <p className="text-lg font-bold mt-1">
              ${Number(property.properties.price).toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {property.properties.bedrooms_total} beds
              </Badge>
              <Badge variant="outline">
                {property.properties.bathroom_total} baths
              </Badge>
              <Badge variant="outline">{property.properties.type || "Plot"}</Badge>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    };

    return <PropertyCard key={property.properties.id} property={property} />;
  })}
</div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage <= 1 || loading}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNumber =
                            currentPage <= 3
                              ? i + 1
                              : currentPage >= totalPages - 2
                                ? totalPages - 4 + i
                                : currentPage - 2 + i

                          if (pageNumber <= 0 || pageNumber > totalPages) return null

                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              disabled={loading}
                              className="w-9"
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                        disabled={currentPage >= totalPages || loading}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
        <div className="container mx-auto mt-8">
          <p className="text-xs mt-5">
          Real Group Realty, Brokerage, the Real Group Web App, and the Real Group Mobile App are operated under license from Real Group Holdings Inc. Real Group Ventures Ltd., its subsidiaries, Community Trust Company ("CTC"), Flexiti Financial Inc., and Real Group Holdings Inc. are members of the Real Group Holdings family of companies. The Real Group Holdings family refers to Real Group Holdings Inc. and its affiliates, which provide deposit, investment, loan, securities, mortgage, real estate, and related financial or property services.
          </p>
          <p className="text-xs mt-5">
          The REALTOR® trademark is owned and regulated by The Canadian Real Estate Association (CREA) and signifies real estate professionals who are CREA members. The MLS®, Multiple Listing Service® trademarks, and associated logos denote services provided by REALTOR® members of CREA to facilitate real estate transactions through a collaborative system.0.34 index This text mirrors the structure of the original while aligning with Real Group branding. Adjust affiliate names or services as needed to reflect your organization’s specifics.
          </p>
        </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

