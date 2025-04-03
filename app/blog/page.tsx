import { Suspense } from "react"
import { getBlogs, getBlogCategories, getBlogTags } from "@/lib/models/blog"
import { BlogList } from "@/components/blog/blog-list"
import { BlogFilters } from "@/components/blog/blog-filters"
import { BlogSearch } from "@/components/blog/blog-search"
import { Pagination } from "@/components/blog/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const dynamic = "force-dynamic"

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; search?: string; tag?: string }
}) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const category = searchParams?.category || ""
  const search = searchParams?.search || ""
  const tag = searchParams?.tag || ""

  const { blogs, pagination } = await getBlogs({ page, category, search, tag })
  const categories = await getBlogCategories()
  const tags = await getBlogTags()

  return (
    <div className="min-h-screen bg-background">
          <SiteHeader />
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Real Estate Blogs</h1>
        <p className="text-gray-600 text-center max-w-2xl">
          Explore our latest articles, guides, and resources to help you make informed decisions about real estate.
        </p>
      </div>

      <div className="mb-8">
        <BlogSearch initialSearch={search} />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Filter by:</h2>
        <BlogFilters categories={categories} tags={tags} activeCategory={category} activeTag={tag} />
      </div>

      <Suspense fallback={<BlogListSkeleton />}>
        <BlogList blogs={blogs} />
      </Suspense>

      <div className="mt-8">
        <Pagination pagination={pagination} />
      </div>
    </div>
    <SiteFooter />
    </div>
  )
}

function BlogListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

