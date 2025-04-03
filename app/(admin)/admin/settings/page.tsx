"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function AdminSettingsPage() {
  const [adminEmails, setAdminEmails] = useState([])
  const [newEmail, setNewEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAdminEmails()
  }, [])

  const fetchAdminEmails = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/whitelist")
      const data = await response.json()

      if (data.success) {
        setAdminEmails(data.adminEmails)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch admin emails",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching admin emails:", error)
      toast({
        title: "Error",
        description: "Failed to fetch admin emails",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdminEmail = async (e:any) => {
    e.preventDefault()

    if (!newEmail || !fullName) {
      toast({
        title: "Error",
        description: "Email and full name are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newEmail, fullName }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Admin email added successfully",
        })
        setNewEmail("")
        setFullName("")
        fetchAdminEmails()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add admin email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding admin email:", error)
      toast({
        title: "Error",
        description: "Failed to add admin email",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveAdminEmail = async (id:any) => {
    try {
      const response = await fetch(`/api/admin/whitelist?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Admin email removed successfully",
        })
        fetchAdminEmails()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to remove admin email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing admin email:", error)
      toast({
        title: "Error",
        description: "Failed to remove admin email",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>

        <Tabs defaultValue="admin-access">
          <TabsList className="mb-6">
            <TabsTrigger value="admin-access">Admin Access</TabsTrigger>
            <TabsTrigger value="general">General Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="admin-access">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add Admin Email</CardTitle>
                  <CardDescription>
                    Add email addresses that can access the admin dashboard without verification.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddAdminEmail} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="admin@example.com"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add Admin Email"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Admin Emails</CardTitle>
                  <CardDescription>These email addresses have direct access to the admin dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading...</p>
                  ) : adminEmails.length === 0 ? (
                    <p className="text-muted-foreground">No admin emails added yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {adminEmails.map((item:any) => (
                        <li key={item?._id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div>
                            <p className="font-medium">{item?.fullName}</p>
                            <p className="text-sm text-muted-foreground">{item?.email}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAdminEmail(item?._id)}
                            title="Remove admin access"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure general settings for your application.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">General settings will be added here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

