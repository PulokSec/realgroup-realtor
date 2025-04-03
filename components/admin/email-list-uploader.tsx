"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Upload, FileUp, Users, Plus, Trash } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function EmailListUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [emailLists, setEmailLists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newListName, setNewListName] = useState("")
  const [newListDescription, setNewListDescription] = useState("")
  const [isCreatingList, setIsCreatingList] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Fetch email lists on component mount
  useState(() => {
    const fetchEmailLists = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/email-lists")
        if (response.ok) {
          const data = await response.json()
          setEmailLists(data)
        }
      } catch (error) {
        console.error("Error fetching email lists:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmailLists()
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("listName", newListName)
      formData.append("description", newListDescription)

      const response = await fetch("/api/admin/email-lists/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      const result = await response.json()

      toast({
        title: "Upload successful",
        description: `${result.importedCount} email addresses imported successfully.`,
      })

      // Reset form
      setFile(null)
      setNewListName("")
      setNewListDescription("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Refresh email lists
      const listsResponse = await fetch("/api/admin/email-lists")
      if (listsResponse.ok) {
        const data = await listsResponse.json()
        setEmailLists(data)
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "An error occurred during upload",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateList = async () => {
    if (!newListName) return

    setIsCreatingList(true)

    try {
      const response = await fetch("/api/admin/email-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newListName,
          description: newListDescription,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create list")
      }

      const result = await response.json()

      toast({
        title: "List created",
        description: `Email list "${newListName}" created successfully.`,
      })

      // Reset form
      setNewListName("")
      setNewListDescription("")

      // Refresh email lists
      const listsResponse = await fetch("/api/admin/email-lists")
      if (listsResponse.ok) {
        const data = await listsResponse.json()
        setEmailLists(data)
      }
    } catch (err) {
      toast({
        title: "Creation failed",
        description: err instanceof Error ? err.message : "An error occurred while creating the list",
        variant: "destructive",
      })
    } finally {
      setIsCreatingList(false)
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this email list?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/email-lists/${listId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete list")
      }

      toast({
        title: "List deleted",
        description: "Email list deleted successfully.",
      })

      // Refresh email lists
      const listsResponse = await fetch("/api/admin/email-lists")
      if (listsResponse.ok) {
        const data = await listsResponse.json()
        setEmailLists(data)
      }
    } catch (err) {
      toast({
        title: "Deletion failed",
        description: err instanceof Error ? err.message : "An error occurred while deleting the list",
        variant: "destructive",
      })
    }
  }

  const handleImportFromContacts = async () => {
    try {
      const response = await fetch("/api/admin/email-lists/import-contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listName: "All Contacts",
          description: "Automatically imported from contacts",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to import contacts")
      }

      const result = await response.json()

      toast({
        title: "Import successful",
        description: `${result.importedCount} contacts imported successfully.`,
      })

      // Refresh email lists
      const listsResponse = await fetch("/api/admin/email-lists")
      if (listsResponse.ok) {
        const data = await listsResponse.json()
        setEmailLists(data)
      }
    } catch (err) {
      toast({
        title: "Import failed",
        description: err instanceof Error ? err.message : "An error occurred during import",
        variant: "destructive",
      })
    }
  }

  return (
    <Tabs defaultValue="lists">
      <TabsList className="mb-6">
        <TabsTrigger value="lists">My Lists</TabsTrigger>
        <TabsTrigger value="upload">Upload List</TabsTrigger>
        <TabsTrigger value="create">Create List</TabsTrigger>
        <TabsTrigger value="import">Import Contacts</TabsTrigger>
      </TabsList>

      <TabsContent value="lists">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : emailLists.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">No email lists yet</h3>
            <p className="text-muted-foreground mt-2">
              Create your first email list to start sending campaigns
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>List Name</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailLists.map((list) => (
                  <TableRow key={list._id}>
                    <TableCell className="font-medium">
                      {list.name}
                      {list.description && (
                        <p className="text-xs text-muted-foreground">{list.description}</p>
                      )}
                    </TableCell>
                    <TableCell>{list.subscriberCount}</TableCell>
                    <TableCell>{new Date(list.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={list.isActive ? "default" : "secondary"}>
                        {list.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteList(list._id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="upload">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="list-name">List Name</Label>
            <Input 
              id="list-name" 
              value={newListName} 
              onChange={(e) => setNewListName(e.target.value)} 
              placeholder="Enter a name for this list" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="list-description">Description (Optional)</Label>
            <Input 
              id="list-description" 
              value={newListDescription} 
              onChange={(e) => setNewListDescription(e.target.value)} 
              placeholder="Enter a description for this list" 
            />
          </div>

          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV file with email addresses (MAX. 10MB)</p>
                {file && (
                  <p className="mt-2 text-sm font-medium text-primary">{file.name}</p>
                )}
              </div>
              <input
                id="csv-upload"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>The CSV file should have the following format:</p>
            <pre className="mt-2 p-2 bg-muted rounded-md">
              email,name,phone
              example@example.com,John Doe,123-456-7890
              another@example.com,Jane Smith,
            </pre>
            <p className="mt-2">Only the email column is required.</p>
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={!file || !newListName || isUploading} 
            className="w-full"
          >
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Upload CSV
              </>
            )}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="create">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-list-name">List Name</Label>
            <Input 
              id="new-list-name" 
              value={newListName} 
              onChange={(e) => setNewListName(e.target.value)} 
              placeholder="Enter a name for this list" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-list-description">Description (Optional)</Label>
            <Input 
              id="new-list-description" 
              value={newListDescription} 
              onChange={(e) => setNewListDescription(e.target.value)} 
              placeholder="Enter a description for this list" 
            />
          </div>

          <Button 
            onClick={handleCreateList} 
            disabled={!newListName || isCreatingList} 
            className="w-full"
          >
            {isCreatingList ? (
              <>Creating...</>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Empty List
              </>
            )}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="import">
        <div className="space-y-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Import From Contacts</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Import email addresses from your existing contacts, leads, and users to create a new email list.
            </p>
            <Button 
              onClick={handleImportFromContacts} 
              className="mt-6"
            >
              Import All Contacts
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-32">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <div>Import from Leads</div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import from Leads</DialogTitle>
                  <DialogDescription>
                    Create a new email list from your leads database
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="lead-list-name">List Name</Label>
                    <Input 
                      id="lead-list-name" 
                      defaultValue="Leads List" 
                      placeholder="Enter a name for this list" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead-list-description">Description (Optional)</Label>
                    <Input 
                      id="lead-list-description" 
                      defaultValue="Imported from leads database" 
                      placeholder="Enter a description for this list" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Import Leads</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-32">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <div>Import from Users</div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import from Users</DialogTitle>
                  <DialogDescription>
                    Create a new email list from your registered users
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-list-name">List Name</Label>
                    <Input 
                      id="user-list-name" 
                      defaultValue="Users List" 
                      placeholder="Enter a name for this list" 
                    />
                  </div>
                      placeholder="Enter a name for this list" 
                    <div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-list-description">Description (Optional)</Label>
                    <Input 
                      id="user-list-description" 
                      defaultValue="Imported from registered users" 
                      placeholder="Enter a description for this list" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Import Users</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-32">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <div>Import from Contacts</div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import from Contacts</DialogTitle>
                  <DialogDescription>
                    Create a new email list from your contact form submissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-list-name">List Name</Label>
                    <Input 
                      id="contact-list-name" 
                      defaultValue="Contacts List" 
                      placeholder="Enter a name for this list" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-list-description">Description (Optional)</Label>
                    <Input 
                      id="contact-list-description" 
                      defaultValue="Imported from contact form submissions" 
                      placeholder="Enter a description for this list" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Import Contacts</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </TabsContent>
  </Tabs>
  )
}

