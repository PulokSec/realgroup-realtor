"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "./columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminLayout from "../layout"

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch(`/api/admin/leads?status=${filter}`)
        const data = await response.json()
        setLeads(data?.leads)
      } catch (error) {
        console.error("Error fetching leads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [filter])

  if (loading) {
    return <div className="p-6">Loading leads...</div>
  }

  return (
    <AdminLayout>
        <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Button>Add Lead</Button>
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={leads} />
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  )
}

