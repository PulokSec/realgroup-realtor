"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash, Copy } from "lucide-react"
import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(() => import("@/components/ui/editor"), { ssr: false })

export function EmailTemplates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [templateName, setTemplateName] = useState("")
  const [templateContent, setTemplateContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/email-templates")
        if (response.ok) {
          const data = await response.json()
          setTemplates(data)
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleCreateTemplate = async () => {
    if (!templateName || !templateContent) return

    setIsCreating(true)

    try {
      const response = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: templateName,
          content: templateContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create template")
      }

      const newTemplate = await response.json()

      toast({
        title: "Template created",
        description: `Email template "${templateName}" created successfully.`,
      })

      // Add new template to list
      setTemplates([...templates, newTemplate])

      // Reset form
      setTemplateName("")
      setTemplateContent("")
      setIsCreating(false)
    } catch (err) {
      toast({
        title: "Creation failed",
        description: err instanceof Error ? err.message : "An error occurred while creating the template",
        variant: "destructive",
      })
      setIsCreating(false)
    }
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate || !templateName || !templateContent) return

    setIsEditing(true)

    try {
      const response = await fetch(`/api/admin/email-templates/${selectedTemplate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: templateName,
          content: templateContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update template")
      }

      const updatedTemplate = await response.json()

      toast({
        title: "Template updated",
        description: `Email template "${templateName}" updated successfully.`,
      })

      // Update template in list
      setTemplates(templates.map((t) => (t._id === selectedTemplate._id ? updatedTemplate : t)))

      // Reset form
      setSelectedTemplate(null)
      setTemplateName("")
      setTemplateContent("")
      setIsEditing(false)
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "An error occurred while updating the template",
        variant: "destructive",
      })
      setIsEditing(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete template")
      }

      toast({
        title: "Template deleted",
        description: "Email template deleted successfully.",
      })

      // Remove template from list
      setTemplates(templates.filter((t) => t._id !== templateId))
    } catch (err) {
      toast({
        title: "Deletion failed",
        description: err instanceof Error ? err.message : "An error occurred while deleting the template",
        variant: "destructive",
      })
    }
  }

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template)
    setTemplateName(template.name)
    setTemplateContent(template.content)
  }

  const handleDuplicateTemplate = (template: any) => {
    setTemplateName(`${template.name} (Copy)`)
    setTemplateContent(template.content)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>Create a reusable email template for your campaigns</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter a name for this template"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-content">Template Content</Label>
                <div className="min-h-[300px]">
                  <Editor
                    value={templateContent}
                    onChange={setTemplateContent}
                    placeholder="Design your email template here..."
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTemplate} disabled={!templateName || !templateContent || isCreating}>
                {isCreating ? "Creating..." : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">No templates yet</h3>
          <p className="text-muted-foreground mt-2">Create your first email template to start sending campaigns</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template._id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>Created on {new Date(template.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 overflow-hidden bg-muted rounded-md p-2 text-xs">
                  <div dangerouslySetInnerHTML={{ __html: template.content.substring(0, 200) + "..." }} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleDuplicateTemplate(template)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Edit Email Template</DialogTitle>
                        <DialogDescription>Update your email template</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-template-name">Template Name</Label>
                          <Input
                            id="edit-template-name"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Enter a name for this template"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-template-content">Template Content</Label>
                          <div className="min-h-[300px]">
                            <Editor
                              value={templateContent}
                              onChange={setTemplateContent}
                              placeholder="Design your email template here..."
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleUpdateTemplate}
                          disabled={!templateName || !templateContent || isEditing}
                        >
                          {isEditing ? "Updating..." : "Update Template"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTemplate(template._id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

