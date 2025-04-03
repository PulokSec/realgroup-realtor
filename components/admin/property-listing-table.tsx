"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Property {
  _id: string
  properties: {
    id: string
    street_address: string
    city: string
    price: string
    bedrooms_total: string
    bathroom_total: string
    type: string
    isCustom: boolean
    listing_id: string
  }
}

export function PropertyListingTable() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState("all")
  const { toast } = useToast()

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/properties?page=${currentPage}&limit=10&search=${searchTerm}&filter=${filter}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch properties")
      }

      const data = await response.json()
      setProperties(data.properties)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [currentPage, filter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProperties()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete property")
      }

      toast({
        title: "Property deleted",
        description: "The property has been deleted successfully",
      })

      fetchProperties()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Listings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="Search address or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter listings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Listings</SelectItem>
              <SelectItem value="custom">Custom Only</SelectItem>
              <SelectItem value="imported">Imported Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Beds/Baths</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No properties found.
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => (
                  <TableRow key={property._id}>
                    <TableCell className="font-medium">
                      {property.properties.street_address}
                      <div className="text-xs text-muted-foreground">
                        {property.properties.city.charAt(0).toUpperCase() + property.properties.city.slice(1)}
                      </div>
                    </TableCell>
                    <TableCell>${Number(property.properties.price).toLocaleString()}</TableCell>
                    <TableCell>{property.properties.type}</TableCell>
                    <TableCell>
                      {property.properties.bedrooms_total} / {property.properties.bathroom_total}
                    </TableCell>
                    <TableCell>
                      <Badge variant={property.properties.isCustom ? "default" : "secondary"}>
                        {property.properties.isCustom ? "Custom" : "Imported"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(property._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))}
              disabled={currentPage >= totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

