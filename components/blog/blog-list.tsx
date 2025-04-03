import Link from "next/link"
import Image from "next/image"
import type { IBlog } from "@/lib/models/blog"
import { formatDate } from "@/lib/utils"

export function BlogList({ blogs }: { blogs: IBlog[] }) {
  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No blog posts found</h3>
        <p className="text-gray-600 mt-2">Try adjusting your search or filter criteria</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogs.map((blog) => (
        <BlogCard key={blog._id.toString()} blog={blog} />
      ))}
    </div>
  )
}

export function BlogCard({ blog }: { blog: IBlog }) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/blog/${blog.slug}`}>
        <div className="relative h-48 w-full">
          <Image src={blog.featuredImage || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span>{formatDate(blog.publishedAt)}</span>
          {blog.category && (
            <>
              <span className="mx-2">•</span>
              <Link href={`/blog?category=${encodeURIComponent(blog.category)}`} className="hover:text-primary">
                {blog.category}
              </Link>
            </>
          )}
        </div>
        <Link href={`/blog/${blog.slug}`}>
          <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">{blog.title}</h3>
        </Link>
        <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
        <Link href={`/blog/${blog.slug}`} className="text-primary font-medium hover:underline">
          Read more
        </Link>
      </div>
    </div>
  )
}

