"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ExternalLink } from "lucide-react"

interface SavedHome {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  photoUrl: string
  propertyType: string
  savedAt: string
}

export function SavedHomesTab() {
  const [savedHomes, setSavedHomes] = useState<SavedHome[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSavedHomes = async () => {
      try {
        // This would be a real API call in production
        // Mocking data for demonstration
        setSavedHomes([
          {
            id: "1",
            address: "123 Aspen Ridge Drive, Surrey",
            price: 749000,
            bedrooms: 4,
            bathrooms: 3,
            sqft: 2400,
            photoUrl: "/placeholder.svg?height=400&width=600&text=Property 1",
            propertyType: "House",
            savedAt: new Date().toISOString(),
          },
          {
            id: "2",
            address: "456 Downtown Ave, Surrey",
            price: 349000,
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1200,
            photoUrl: "/placeholder.svg?height=400&width=600&text=Property 2",
            propertyType: "Condo",
            savedAt: new Date().toISOString(),
          },
        ])
      } catch (error) {
        console.error("Error fetching saved homes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedHomes()
  }, [])

  if (loading) {
    return <div>Loading saved homes...</div>
  }

  if (savedHomes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No saved homes yet</h3>
        <p className="text-muted-foreground mt-2">Save properties you're interested in to compare them later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedHomes.map((home) => (
          <Card key={home.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image src={home.photoUrl || "/placeholder.svg"} alt={home.address} fill className="object-cover" />
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium truncate">{home.address}</h3>
              <p className="text-lg font-bold mt-1">${home.price.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{home.bedrooms} beds</Badge>
                <Badge variant="outline">{home.bathrooms} baths</Badge>
                <Badge variant="outline">{home.sqft.toLocaleString()} sqft</Badge>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-muted-foreground">
                  Saved {new Date(home.savedAt).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

