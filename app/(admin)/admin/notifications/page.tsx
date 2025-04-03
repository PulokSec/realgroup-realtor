"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "./columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminLayout from "../layout"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/admin/notifications?type=${filter}`)
        const data = await response.json()
        setNotifications(data)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [filter])

  if (loading) {
    return <div className="p-6">Loading notifications...</div>
  }

  return (
    <AdminLayout>
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="message">Message</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
          <Button>Send Notification</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={notifications} />
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  )
}

