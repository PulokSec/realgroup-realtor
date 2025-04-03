"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PropertyGrid } from "@/components/property-grid"
import { ListingsFilters } from "@/components/listings-filters"
import { Button } from "@/components/ui/button"
import { Map, ArrowUpDown, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePropertyStore } from "@/lib/store"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { MobileFilters } from "@/components/mobile-filters"

export default function ListingsPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("recommended")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [itemsPerPage] = useState(12)
  const [showFilters, setShowFilters] = useState(false)
  const { filters } = usePropertyStore()
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)

        // Build query parameters
        const params = new URLSearchParams()
        params.append("page", currentPage.toString())
        params.append("limit", itemsPerPage.toString())

        if (filters.type) params.append("type", filters.type)
        if (filters.priceRange) {
          const [min, max] = filters.priceRange.split("-")
          if (min) params.append("minPrice", min)
          if (max) params.append("maxPrice", max)
        }
        if (filters.beds) params.append("beds", filters.beds)
        if (filters.propertyType) params.append("propertyType", filters.propertyType)

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

    fetchProperties()
  }, [currentPage, filters, itemsPerPage])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container py-4 md:py-8">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Surrey Real Estate</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Refine your Surrey real estate search by price, bedroom, or type (house, townhouse, or condo). View
            up-to-date MLS® listings in Surrey.
          </p>
        </div>

        {isMobile ? (
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <ArrowUpDown className="mr-2 h-3 w-3" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" asChild>
              <Link href="/map-search">
                <Map className="mr-2 h-4 w-4" />
                Map
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <ListingsFilters />

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" asChild>
                <Link href="/map-search">
                  <Map className="mr-2 h-4 w-4" />
                  Map Search
                </Link>
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            {!isMobile && (
              <>
                <Button variant="outline" size="sm">
                  Market Stats
                </Button>
                <Button variant="outline" size="sm">
                  Neighbourhoods
                </Button>
                <Button variant="outline" size="sm">
                  Recently Sold
                </Button>
              </>
            )}
          </div>
          <p className="text-xs md:text-sm font-medium">
            Showing {totalResults > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
            {Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults} homes for sale in Surrey, BC
          </p>
        </div>

        <PropertyGrid properties={properties} loading={loading} sortBy={sortBy} />

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
                    currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i

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
        <div className="container mx-auto mt-10">
          <p className="text-xs mt-5">
          Real Group Realty, Brokerage, the Real Group Web App, and the Real Group Mobile App are operated under license from Real Group Holdings Inc. Real Group Ventures Ltd., its subsidiaries, Community Trust Company ("CTC"), Flexiti Financial Inc., and Real Group Holdings Inc. are members of the Real Group Holdings family of companies. The Real Group Holdings family refers to Real Group Holdings Inc. and its affiliates, which provide deposit, investment, loan, securities, mortgage, real estate, and related financial or property services.
          </p>
          <p className="text-xs mt-5">
          The REALTOR® trademark is owned and regulated by The Canadian Real Estate Association (CREA) and signifies real estate professionals who are CREA members. The MLS®, Multiple Listing Service® trademarks, and associated logos denote services provided by REALTOR® members of CREA to facilitate real estate transactions through a collaborative system.0.34 index This text mirrors the structure of the original while aligning with Real Group branding. Adjust affiliate names or services as needed to reflect your organization’s specifics.
          </p>
        </div>
      </main>

      {/* Mobile Filters Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="left" className="w-[85vw] sm:w-[400px]">
          <MobileFilters onClose={() => setShowFilters(false)} />
        </SheetContent>
      </Sheet>

      <SiteFooter />
    </div>
  )
}

