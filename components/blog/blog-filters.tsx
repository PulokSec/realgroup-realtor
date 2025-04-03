"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BlogFilters({
  categories,
  tags,
  activeCategory,
  activeTag,
}: {
  categories: string[]
  tags: string[]
  activeCategory: string
  activeTag: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("categories")

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === activeCategory) {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    params.delete("page")
    router.push(`/blog?${params.toString()}`)
  }

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams)
    if (tag === activeTag) {
      params.delete("tag")
    } else {
      params.set("tag", tag)
    }
    params.delete("page")
    router.push(`/blog?${params.toString()}`)
  }

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("category")
    params.delete("tag")
    params.delete("page")
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <div className="mb-8">
      <div className="flex border-b mb-4">
        <button
          className={cn(
            "px-4 py-2 font-medium",
            activeTab === "categories" ? "border-b-2 border-primary" : "text-gray-500",
          )}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={cn("px-4 py-2 font-medium", activeTab === "tags" ? "border-b-2 border-primary" : "text-gray-500")}
          onClick={() => setActiveTab("tags")}
        >
          Tags
        </button>
      </div>

      {activeTab === "categories" ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === activeCategory ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={tag === activeTag ? "default" : "outline"}
              size="sm"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}

      {(activeCategory || activeTag) && (
        <div className="mt-4">
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}

