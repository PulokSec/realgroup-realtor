"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { IBlog } from "@/lib/models/blog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save, Eye, X } from "lucide-react"
import dynamic from "next/dynamic"
import type { Descendant } from "slate"

// Import the Slate editor dynamically to avoid SSR issues
const SlateEditor = dynamic(() => import("./slate-editor"), {
  ssr: false,
  loading: () => <div className="h-64 border rounded-md flex items-center justify-center">Loading editor...</div>,
})

interface BlogEditorProps {
  blog?: IBlog
}

export function BlogEditor({ blog }: BlogEditorProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [tagInput, setTagInput] = useState("")

  const [formData, setFormData] = useState({
    title: blog?.title || "",
    slug: blog?.slug || "",
    excerpt: blog?.excerpt || "",
    content: blog?.content || "",
    featuredImage: blog?.featuredImage || "",
    category: blog?.category || "",
    tags: blog?.tags || [],
    authorName: blog?.author?.name || "",
    authorImage: blog?.author?.image || "",
    authorBio: blog?.author?.bio || "",
    published: blog?.published || false,
  })

  const [content, setContent] = useState<Descendant[]>(() => {
    if (blog?.content) {
      try {
        // Try to parse as JSON first (for new format)
        return JSON.parse(blog.content)
      } catch (e) {
        // If it fails, it's probably the old format (string)
        return [
          {
            type: "paragraph",
            children: [{ text: blog.content }],
          },
        ]
      }
    }
    // Default empty content
    return [
      {
        type: "paragraph",
        children: [{ text: "" }],
      },
    ]
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/blog/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return

    try {
      const response = await fetch("/api/admin/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory.trim() })
      })

      if (!response.ok) throw new Error("Failed to add category")

      const updated = await fetch("/api/admin/blog/categories")
      const data = await updated.json()
      setCategories(data.categories)
      setFormData(prev => ({ ...prev, category: newCategory.trim() }))
      setNewCategory("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add new category",
        variant: "destructive",
      })
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (["Enter", ","].includes(e.key) && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().replace(/,/g, "")
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }))
      }
      setTagInput("")
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (newContent: Descendant[]) => {
    setContent(newContent)
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")

    setFormData((prev) => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()

    if (!formData.title || content.length === 0 || !formData.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        content: JSON.stringify(content),
        tags: formData.tags
          .map((tag) => tag.trim())
          .filter(Boolean),
        author: {
          name: formData.authorName,
          image: formData.authorImage,
          bio: formData.authorBio,
        },
        published: publish,
      }

      const url = blog ? `/api/admin/blog/${blog._id}` : "/api/admin/blog"

      const response = await fetch(url, {
        method: blog ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to save blog post")
      }

      const data = await response.json()

      toast({
        title: blog ? "Blog post updated" : "Blog post created",
        description: `The blog post has been ${blog ? "updated" : "created"} successfully.`,
      })

      if (!blog) {
        router.push(`/admin/blog/${data.blog._id}/edit`)
      } else {
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save blog post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreview = () => {
    // Store the current form data in localStorage for the preview page
    localStorage.setItem(
      "blogPreview",
      JSON.stringify({
        ...formData,
        tags: formData.tags
          .map((tag) => tag.trim())
          .filter(Boolean),
        author: {
          name: formData.authorName,
          image: formData.authorImage,
          bio: formData.authorBio,
        },
      }),
    )

    // Open the preview in a new tab
    window.open("/admin/blog/preview", "_blank")
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="flex gap-4">
                <div className="space-y-2 flex-grow">
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="flex gap-2">
                    <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} required />
                    <Button type="button" variant="outline" onClick={generateSlug} disabled={!formData.title}>
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <SlateEditor value={content} onChange={handleContentChange} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="featuredImage">Featured Image URL *</Label>
                <Input
                  id="featuredImage"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  required
                />
                {formData.featuredImage && (
                  <div className="mt-2 relative h-40 w-full rounded-md overflow-hidden">
                    <img
                      src={formData.featuredImage || "/placeholder.svg"}
                      alt="Featured"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={value => {
                    if (value === "new") return
                    setFormData(prev => ({ ...prev, category: value }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category, index) => (
                      <SelectItem key={index} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {formData.category === "new" && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddCategory}
                      disabled={!newCategory.trim()}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="border rounded-md p-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-muted px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type tag and press Enter"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={handlePreview} disabled={isSubmitting}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>

        <div className="space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </>
            )}
          </Button>

          <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting} variant="default">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

