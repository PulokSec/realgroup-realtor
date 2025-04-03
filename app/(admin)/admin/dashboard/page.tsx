"use client"

import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, Bell, UserPlus, Home, TrendingUp } from "lucide-react"
import AdminLayout from "../layout"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    messages: 0,
    notifications: 0,
    leads: 0,
    properties: 0,
    views: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <AdminLayout>
        <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">Registered users on the platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages}</div>
            <p className="text-xs text-muted-foreground">Contact messages received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notifications}</div>
            <p className="text-xs text-muted-foreground">System notifications sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
            <p className="text-xs text-muted-foreground">New leads generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.properties}</div>
            <p className="text-xs text-muted-foreground">Active property listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views}</div>
            <p className="text-xs text-muted-foreground">Total website page views</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* This would be populated with actual lead data */}
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-muted-foreground">johnsmith@example.com</p>
                </div>
                <Badge variant="outline">New</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">sarah.j@example.com</p>
                </div>
                <Badge variant="outline">Contacted</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Michael Brown</p>
                  <p className="text-sm text-muted-foreground">mbrown@example.com</p>
                </div>
                <Badge variant="outline">Qualified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* This would be populated with actual message data */}
              <div className="border-b pb-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Property Inquiry</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  I'm interested in the property at 123 Main St. Is it still available?
                </p>
              </div>
              <div className="border-b pb-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Viewing Request</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  I would like to schedule a viewing for the house in Aspen Ridge.
                </p>
              </div>
              <div className="border-b pb-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Price Question</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  Is there any flexibility on the asking price for the condo?
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminLayout>
  )
}

