"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit } from "lucide-react"

interface SavedSearch {
  id: string
  name: string
  criteria: {
    location: string
    minPrice?: number
    maxPrice?: number
    bedrooms?: number
    propertyType?: string
  }
  createdAt: string
}

export function SavedSearchesTab() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSavedSearches = async () => {
      try {
        // This would be a real API call in production
        // Mocking data for demonstration
        setSavedSearches([
          {
            id: "1",
            name: "Aspen Ridge Homes",
            criteria: {
              location: "Aspen Ridge, Surrey",
              minPrice: 400000,
              maxPrice: 800000,
              bedrooms: 3,
              propertyType: "House",
            },
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Downtown Condos",
            criteria: {
              location: "Downtown, Surrey",
              minPrice: 200000,
              maxPrice: 500000,
              bedrooms: 2,
              propertyType: "Condo",
            },
            createdAt: new Date().toISOString(),
          },
        ])
      } catch (error) {
        console.error("Error fetching saved searches:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedSearches()
  }, [])

  if (loading) {
    return <div>Loading saved searches...</div>
  }

  if (savedSearches.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No saved searches yet</h3>
        <p className="text-muted-foreground mt-2">
          Save your search criteria to get notified when new properties match your preferences.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedSearches.map((search) => (
          <Card key={search.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">{search.name}</h3>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{search.criteria.location}</Badge>
                  {search.criteria.minPrice && search.criteria.maxPrice && (
                    <Badge variant="outline">
                      ${search.criteria.minPrice.toLocaleString()} - ${search.criteria.maxPrice.toLocaleString()}
                    </Badge>
                  )}
                  {search.criteria.bedrooms && <Badge variant="outline">{search.criteria.bedrooms}+ beds</Badge>}
                  {search.criteria.propertyType && <Badge variant="outline">{search.criteria.propertyType}</Badge>}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Created {new Date(search.createdAt).toLocaleDateString()}
                </span>
                <Button variant="default" size="sm">
                  View Results
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

