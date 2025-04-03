"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export function EmailStats() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7days")

  // Fetch stats on component mount and when timeRange changes
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/email-stats?timeRange=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching email stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [timeRange])

  // Mock data for demonstration
  const mockData = {
    summary: {
      totalSent: 1250,
      opened: 875,
      clicked: 320,
      bounced: 25,
      unsubscribed: 15,
    },
    dailyStats: [
      { date: "Mon", sent: 180, opened: 120, clicked: 45 },
      { date: "Tue", sent: 200, opened: 150, clicked: 60 },
      { date: "Wed", sent: 250, opened: 180, clicked: 75 },
      { date: "Thu", sent: 280, opened: 200, clicked: 85 },
      { date: "Fri", sent: 220, opened: 160, clicked: 55 },
      { date: "Sat", sent: 120, opened: 65, clicked: 20 },
      { date: "Sun", sent: 100, opened: 50, clicked: 15 },
    ],
    engagementRate: [
      { name: "Opened", value: 70 },
      { name: "Not Opened", value: 30 },
    ],
    clickRate: [
      { name: "Clicked", value: 25 },
      { name: "Not Clicked", value: 75 },
    ],
    topCampaigns: [
      { name: "Welcome Series", sent: 450, openRate: 82, clickRate: 35 },
      { name: "Monthly Newsletter", sent: 350, openRate: 68, clickRate: 22 },
      { name: "Property Alert", sent: 280, openRate: 75, clickRate: 30 },
      { name: "Holiday Special", sent: 170, openRate: 62, clickRate: 18 },
    ],
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Use mock data for demonstration
  const data = mockData

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Analytics</h2>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="90days">90 Days</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Emails sent in selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.summary.opened / data.summary.totalSent) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{data.summary.opened.toLocaleString()} emails opened</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.summary.clicked / data.summary.totalSent) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{data.summary.clicked.toLocaleString()} link clicks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.summary.bounced / data.summary.totalSent) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{data.summary.bounced.toLocaleString()} emails bounced</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Email Activity</CardTitle>
            <CardDescription>Email sending and engagement over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                  <Bar dataKey="opened" fill="#82ca9d" name="Opened" />
                  <Bar dataKey="clicked" fill="#ffc658" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>Open and click rates for your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 h-80">
              <div>
                <h3 className="text-sm font-medium text-center mb-2">Open Rate</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={data.engagementRate}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.engagementRate.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-sm font-medium text-center mb-2">Click Rate</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={data.clickRate}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.clickRate.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Campaigns</CardTitle>
          <CardDescription>Campaigns with the highest engagement rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Campaign Name</th>
                  <th className="text-left py-3 px-4">Emails Sent</th>
                  <th className="text-left py-3 px-4">Open Rate</th>
                  <th className="text-left py-3 px-4">Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.topCampaigns.map((campaign, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">{campaign.name}</td>
                    <td className="py-3 px-4">{campaign.sent}</td>
                    <td className="py-3 px-4">{campaign.openRate}%</td>
                    <td className="py-3 px-4">{campaign.clickRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

