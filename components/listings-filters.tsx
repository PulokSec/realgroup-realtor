"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart } from "lucide-react"
import { usePropertyStore } from "@/lib/store"

export function ListingsFilters() {
  const { filters, setFilter } = usePropertyStore()

  return (
    <div className="flex items-center gap-2">
      <Select value={filters.type || "for-sale"} onValueChange={(value) => setFilter("type", value)}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Listing Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="for-sale">For Sale</SelectItem>
          <SelectItem value="for-rent">For Rent</SelectItem>
          <SelectItem value="sold">Sold</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.priceRange || "any"} onValueChange={(value) => setFilter("priceRange", value)}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Price" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Price</SelectItem>
          <SelectItem value="0-300000">Under $300k</SelectItem>
          <SelectItem value="300000-500000">$300k-500k</SelectItem>
          <SelectItem value="500000-750000">$500k-750k</SelectItem>
          <SelectItem value="750000-1000000">$750k-1M</SelectItem>
          <SelectItem value="1000000+">$1M+</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.beds || "any"} onValueChange={(value) => setFilter("beds", value)}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Beds" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">0+ Bed</SelectItem>
          <SelectItem value="1">1+ Bed</SelectItem>
          <SelectItem value="2">2+ Beds</SelectItem>
          <SelectItem value="3">3+ Beds</SelectItem>
          <SelectItem value="4">4+ Beds</SelectItem>
          <SelectItem value="5">5+ Beds</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.propertyType || "any"} onValueChange={(value) => setFilter("propertyType", value)}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Home Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Type</SelectItem>
          <SelectItem value="house">House</SelectItem>
          <SelectItem value="condo">Condo</SelectItem>
          <SelectItem value="townhouse">Townhouse</SelectItem>
          <SelectItem value="duplex">Duplex</SelectItem>
          <SelectItem value="land">Land</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline">More</Button>

      <Button variant="outline" className="ml-2">
        <Heart className="mr-2 h-4 w-4" />
        Save Search
      </Button>
    </div>
  )
}

