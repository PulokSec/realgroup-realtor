"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export function Pagination({ pagination }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { page, pages } = pagination

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`/blog?${params.toString()}`)
  }

  if (pages <= 1) return null

  return (
    <div className="flex justify-center items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {Array.from({ length: Math.min(5, pages) }, (_, i) => {
        let pageNum

        if (pages <= 5) {
          pageNum = i + 1
        } else if (page <= 3) {
          pageNum = i + 1
        } else if (page >= pages - 2) {
          pageNum = pages - 4 + i
        } else {
          pageNum = page - 2 + i
        }

        return (
          <Button
            key={pageNum}
            variant={page === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(pageNum)}
          >
            {pageNum}
          </Button>
        )
      })}

      <Button variant="outline" size="icon" onClick={() => handlePageChange(page + 1)} disabled={page === pages}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

