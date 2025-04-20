"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, LayoutGrid, Filter, X } from "lucide-react"
import { usePropertyStore } from "@/lib/store"
import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function MapFilters() {
  const { filters, setFilter, resetFilters } = usePropertyStore()
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000])
  const [amenities, setAmenities] = useState({
    pool: false,
    garage: false,
    basement: false,
    airConditioning: false,
    fireplace: false,
  })

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]])
  }
  const applyAdvancedFilters = () => {
    setFilter("priceRange", `${priceRange[0]}-${priceRange[1]}`)

    // Apply amenities filters
    Object.entries(amenities).forEach(([key, value]) => {
      if (value) {
        setFilter(key as any, "true")
      } else {
        setFilter(key as any, null)
      }
    })
  }

  const handleResetFilters = () => {
    resetFilters()
    setPriceRange([0, 2000000])
    setAmenities({
      pool: false,
      garage: false,
      basement: false,
      airConditioning: false,
      fireplace: false,
    })
  }

  return (
    <div className="border-b bg-white">
      <div className="flex items-center gap-2 p-4">
        <Select value={filters.priceRange || "any"} onValueChange={(value) => setFilter("priceRange", value)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Any Price" />
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
            <SelectValue placeholder="0+ Bed" />
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

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>Refine your search with more specific criteria</SheetDescription>
            </SheetHeader>

            <div className="py-6 space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Price Range</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 2000000]}
                    min={0}
                    max={2000000}
                    step={10000}
                    value={[priceRange[0], priceRange[1]]}
                    onValueChange={handlePriceChange}
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>${priceRange[0].toLocaleString()}</span>
                    <span>${priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Amenities</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pool"
                      checked={amenities.pool}
                      onCheckedChange={(checked) => setAmenities({ ...amenities, pool: checked === true })}
                    />
                    <Label htmlFor="pool">Pool</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="garage"
                      checked={amenities.garage}
                      onCheckedChange={(checked) => setAmenities({ ...amenities, garage: checked === true })}
                    />
                    <Label htmlFor="garage">Garage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="basement"
                      checked={amenities.basement}
                      onCheckedChange={(checked) => setAmenities({ ...amenities, basement: checked === true })}
                    />
                    <Label htmlFor="basement">Basement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="airConditioning"
                      checked={amenities.airConditioning}
                      onCheckedChange={(checked) => setAmenities({ ...amenities, airConditioning: checked === true })}
                    />
                    <Label htmlFor="airConditioning">Air Conditioning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fireplace"
                      checked={amenities.fireplace}
                      onCheckedChange={(checked) => setAmenities({ ...amenities, fireplace: checked === true })}
                    />
                    <Label htmlFor="fireplace">Fireplace</Label>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter>
              <Button variant="outline" onClick={handleResetFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
              <SheetClose asChild>
                <Button onClick={applyAdvancedFilters}>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Button variant="outline" className="ml-auto">
          <Heart className="mr-2 h-4 w-4" />
          Save Search
        </Button>

        <Button variant="outline" size="icon">
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

