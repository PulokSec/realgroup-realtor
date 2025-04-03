"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeoJsonUploader } from "@/components/admin/geojson-uploader"
import { CustomListingForm } from "@/components/admin/custom-listing-form"
import { PropertyListingTable } from "@/components/admin/property-listing-table"
import AdminLayout from "../layout"

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState("listings")

  return (
    <AdminLayout>
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Property Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="listings">All Listings</TabsTrigger>
          <TabsTrigger value="upload">Upload GeoJSON</TabsTrigger>
          <TabsTrigger value="custom">Add Custom Listing</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <PropertyListingTable />
        </TabsContent>

        <TabsContent value="upload">
          <GeoJsonUploader />
        </TabsContent>

        <TabsContent value="custom">
          <CustomListingForm />
        </TabsContent>
      </Tabs>
    </div>
    </AdminLayout>
  )
}

