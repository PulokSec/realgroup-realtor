"use client"

import { PropertyCard } from "./property-card"
import { Loader } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
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

  return (
    <div className="flex-1 flex flex-col">
      {!hideHeader && (
        <div className="sticky top-0 bg-background z-10 p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{totalCount} Properties</h2>
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>
      )}

      {onBackToMap && (
        <div className="p-4 border-b">
          <Button variant="ghost" onClick={onBackToMap}>
            <MapPin className="h-4 w-4 mr-2" />
            Back to Map
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 grid grid-cols-1 gap-4">
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
          <div className="flex items-center justify-center mt-8 pb-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}