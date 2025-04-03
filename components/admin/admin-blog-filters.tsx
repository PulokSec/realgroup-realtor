"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

export function AdminBlogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [published, setPublished] = useState(searchParams.get("published") || "")
  const [categories, setCategories] = useState<string[]>([])

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }
    params.delete("page")
    router.push(`/admin/blog?${params.toString()}`)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)

    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set("category", value)
    } else {
      params.delete("category")
    }
    params.delete("page")
    router.push(`/admin/blog?${params.toString()}`)
  }

  const handlePublishedChange = (value: string) => {
    setPublished(value)

    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set("published", value)
    } else {
      params.delete("published")
    }
    params.delete("page")
    router.push(`/admin/blog?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearch("")
    setCategory("")
    setPublished("")

    router.push("/admin/blog")
  }

  const hasFilters = search || category || published

  return (
    <div className="bg-white p-4 rounded-lg border mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-grow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search blog posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat,index) => (
                <SelectItem key={index} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={published} onValueChange={handlePublishedChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Published</SelectItem>
              <SelectItem value="false">Draft</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

