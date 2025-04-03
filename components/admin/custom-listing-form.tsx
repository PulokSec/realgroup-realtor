"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"

export function CustomListingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    street_address: "",
    city: "Surrey",
    province: "Saskatchewan",
    postal_code: "",
    price: "",
    bedrooms_total: "",
    bathroom_total: "",
    type: "House",
    description: "",
    photo_url: "",
    latitude: "",
    longitude: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Convert to GeoJSON format
      const geoJsonData = {
        type: "Feature",
        properties: {
          id: `custom-${Date.now()}`,
          street_address: formData.street_address,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postal_code,
          price: formData.price,
          bedrooms_total: formData.bedrooms_total,
          bathroom_total: formData.bathroom_total,
          type: formData.type,
          description: formData.description,
          photo_url: formData.photo_url,
          listing_id: `CL-${Date.now().toString().slice(-6)}`,
          isCustom: true,
        },
        geometry: {
          type: "Point",
          coordinates: [Number.parseFloat(formData.longitude), Number.parseFloat(formData.latitude)],
        },
      }

      const response = await fetch("/api/admin/properties/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(geoJsonData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create listing")
      }

      toast({
        title: "Listing created",
        description: "Your custom listing has been created successfully.",
      })

      // Reset form
      setFormData({
        street_address: "",
        city: "Surrey",
        province: "Saskatchewan",
        postal_code: "",
        price: "",
        bedrooms_total: "",
        bathroom_total: "",
        type: "House",
        description: "",
        photo_url: "",
        latitude: "",
        longitude: "",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Custom Listing</CardTitle>
        <CardDescription>Create a custom property listing to showcase on your website</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street_address">Street Address</Label>
            <Input
              id="street_address"
              name="street_address"
              value={formData.street_address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input id="province" name="province" value={formData.province} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms_total">Bedrooms</Label>
              <Input
                id="bedrooms_total"
                name="bedrooms_total"
                type="number"
                value={formData.bedrooms_total}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathroom_total">Bathrooms</Label>
              <Input
                id="bathroom_total"
                name="bathroom_total"
                type="number"
                value={formData.bathroom_total}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Condo">Condo</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo_url">Photo URL</Label>
            <Input
              id="photo_url"
              name="photo_url"
              type="url"
              value={formData.photo_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                type="text"
                value={formData.latitude}
                onChange={handleChange}
                required
                placeholder="e.g. 52.1332"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                type="text"
                value={formData.longitude}
                onChange={handleChange}
                required
                placeholder="e.g. -106.6700"
              />
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span>Tip: You can find coordinates by right-clicking on Google Maps</span>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Listing"}
        </Button>
      </CardFooter>
    </Card>
  )
}

