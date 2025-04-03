"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { usePropertyStore } from "@/lib/store"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface MobileFiltersProps {
  onClose: () => void
}

export function MobileFilters({ onClose }: MobileFiltersProps) {
  const { filters, setFilter, resetFilters } = usePropertyStore()
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000])
  const [expanded, setExpanded] = useState<string | null>("price")

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]])
    setFilter("priceRange", `${value[0]}-${value[1]}`)
  }

  const handleReset = () => {
    resetFilters()
    setPriceRange([0, 2000000])
    onClose()
  }

  const handleApply = () => {
    onClose()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between py-4">
        <h2 className="text-xl font-bold">Filters</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <Accordion
          type="single"
          collapsible
          value={expanded || undefined}
          onValueChange={(value) => setExpanded(value)}
        >
          <AccordionItem value="price" className="border-b">
            <AccordionTrigger className="py-4">
              <span className="text-base font-medium">Price</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-2 pb-6">
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="beds" className="border-b">
            <AccordionTrigger className="py-4">
              <span className="text-base font-medium">Bedrooms</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-5 gap-2 pb-6">
                {["Any", "1+", "2+", "3+", "4+"].map((option, index) => (
                  <Button
                    key={index}
                    variant={filters.beds === (index === 0 ? "any" : index.toString()) ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setFilter("beds", index === 0 ? "any" : index.toString())}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="baths" className="border-b">
            <AccordionTrigger className="py-4">
              <span className="text-base font-medium">Bathrooms</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-5 gap-2 pb-6">
                {["Any", "1+", "2+", "3+", "4+"].map((option, index) => (
                  <Button
                    key={index}
                    variant={filters.baths === (index === 0 ? "any" : index.toString()) ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setFilter("baths", index === 0 ? "any" : index.toString())}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="type" className="border-b">
            <AccordionTrigger className="py-4">
              <span className="text-base font-medium">Home Type</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 pb-6">
                {["House", "Condo", "Townhouse", "Multi-family", "Land", "Other"].map((option) => (
                  <Button
                    key={option}
                    variant={filters.propertyType === option.toLowerCase() ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setFilter("propertyType", option.toLowerCase())}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="more" className="border-b">
            <AccordionTrigger className="py-4">
              <span className="text-base font-medium">More Filters</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pb-6">
                <div>
                  <h4 className="font-medium mb-2">Square Footage</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="w-full">
                      Any
                    </Button>
                    <Button variant="outline" className="w-full">
                      1000+
                    </Button>
                    <Button variant="outline" className="w-full">
                      1500+
                    </Button>
                    <Button variant="outline" className="w-full">
                      2000+
                    </Button>
                    <Button variant="outline" className="w-full">
                      2500+
                    </Button>
                    <Button variant="outline" className="w-full">
                      3000+
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Year Built</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      2010+
                    </Button>
                    <Button variant="outline" className="w-full">
                      2000+
                    </Button>
                    <Button variant="outline" className="w-full">
                      1990+
                    </Button>
                    <Button variant="outline" className="w-full">
                      1980+
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      Garage
                    </Button>
                    <Button variant="outline" className="w-full">
                      Pool
                    </Button>
                    <Button variant="outline" className="w-full">
                      Waterfront
                    </Button>
                    <Button variant="outline" className="w-full">
                      Basement
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="flex items-center justify-between py-4 border-t">
        <Button variant="outline" onClick={handleReset}>
          Reset All
        </Button>
        <Button onClick={handleApply}>Apply Filters</Button>
      </div>
    </div>
  )
}

