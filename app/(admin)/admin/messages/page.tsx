"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "./columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminLayout from "../layout"

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/admin/messages?status=${filter}`)
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [filter])

  if (loading) {
    return <div className="p-6">Loading messages...</div>
  }

  return (
    <AdminLayout>
        <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button>Export CSV</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={messages} />
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  )
}

