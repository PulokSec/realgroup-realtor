"use client"

import { PropertyCard } from "./property-card"
import { usePropertyStore } from "@/lib/store"
import { Loader } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PropertyListProps {
  isLoading?: boolean
}

export function PropertyList({ isLoading = false }: PropertyListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const properties = usePropertyStore((state) => state.visibleProperties || state.properties)
  const totalCount = usePropertyStore((state) => state.totalVisibleCount || properties.length)
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const selectedProperty = usePropertyStore((state) => state.selectedProperty)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const selectedCardRef = useRef<HTMLDivElement>(null)

  // Get current page items
  const currentItems = properties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Scroll to selected property
  useEffect(() => {
    if (selectedProperty && scrollAreaRef.current) {
      // Find the index of the selected property
      const selectedIndex = properties.findIndex((p) => p.properties.id === selectedProperty)

      if (selectedIndex >= 0) {
        // Calculate which page the property is on
        const propertyPage = Math.floor(selectedIndex / itemsPerPage) + 1

        // Update current page if needed
        if (propertyPage !== currentPage) {
          setCurrentPage(propertyPage)
        }

        // Scroll to the selected property after a short delay to allow rendering
        setTimeout(() => {
          if (selectedCardRef.current) {
            selectedCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }, 100)
      }
    }
  }, [selectedProperty, properties, currentPage, itemsPerPage])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader className="h-8 w-8 animate-spin" />
          <p>Loading properties...</p>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-4">
          <h3 className="font-semibold text-lg">No properties found</h3>
          <p className="text-muted-foreground">Try adjusting your search filters or moving the map</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="font-semibold">{totalCount} Properties</h2>
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
            {totalCount}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentItems.map((property) => (
            <div
              key={property.properties.id}
              ref={property.properties.id === selectedProperty ? selectedCardRef : null}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
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
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
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
    </ScrollArea>
  )
}

