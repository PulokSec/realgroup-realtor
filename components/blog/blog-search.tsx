"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function BlogSearch({ initialSearch = "" }: { initialSearch?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }
    params.delete("page")
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-lg mx-auto">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button type="submit" className="ml-2">
        Search
      </Button>
    </form>
  )
}

