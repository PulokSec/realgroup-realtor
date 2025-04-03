"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "./columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AdminLayout from "../layout"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")
        const data = await response.json()
        setUsers(data?.users)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AdminLayout>
        <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} />
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  )
}

