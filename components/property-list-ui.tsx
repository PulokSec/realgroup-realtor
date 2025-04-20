"use client"

import { PropertyCard } from "./property-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePropertyStore } from "@/lib/store"

interface PropertyListProps {
  properties: any[]
  hideHeader?: boolean
  onBackToMap?: () => void
}

export function PropertyListUi({ properties, hideHeader, onBackToMap }: PropertyListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const totalCount = properties.length
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const selectedProperty = usePropertyStore((state) => state.selectedProperty)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const selectedCardRef = useRef<HTMLDivElement>(null)

  const currentItems = properties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    if (selectedProperty && scrollAreaRef.current) {
      const selectedIndex = properties.findIndex(p => p.properties.id === selectedProperty)
      if (selectedIndex >= 0) {
        const propertyPage = Math.floor(selectedIndex / itemsPerPage) + 1
        setCurrentPage(propertyPage)
        setTimeout(() => {
          selectedCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 100)
      }
    }
  }, [selectedProperty, properties])

  if (properties.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-4">
          <h3 className="font-semibold text-lg">No properties found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      </div>
    )
  }

  const renderPageButtons = () => {
    const pageNumbers = []
    const visiblePages = 4

    const start = Math.max(1, currentPage - visiblePages)
    const end = Math.min(totalPages, currentPage + visiblePages)

    if (start > 1) pageNumbers.push(1)
    if (start > 2) pageNumbers.push("...")

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i)
    }

    if (end < totalPages - 1) pageNumbers.push("...")
    if (end < totalPages) pageNumbers.push(totalPages)

    return pageNumbers.map((page, i) =>
      typeof page === "number" ? (
        <Button
          key={i}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Button>
      ) : (
        <span key={i} className="text-muted-foreground px-2 text-sm">...</span>
      )
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {!hideHeader && (
        <div className="sticky top-0 bg-background z-10 p-4 border-b">
          <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
            <h2 className="font-semibold text-base sm:text-lg">{totalCount} Properties</h2>
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 overflow-auto" ref={scrollAreaRef}>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentItems.map((property) => (
            <div
              key={property.properties.id}
              ref={property.properties.id === selectedProperty ? selectedCardRef : null}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 mb-24 w-full px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {renderPageButtons()}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
