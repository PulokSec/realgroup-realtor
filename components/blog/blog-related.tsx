import Link from "next/link"
import Image from "next/image"
import type { IBlog } from "@/lib/models/blog"
import { formatDate } from "@/lib/utils"

export function BlogRelated({ blogs }: { blogs: IBlog[] }) {
  if (blogs.length === 0) return null

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Related Articles</h3>
      <div className="space-y-4">
        {blogs.map((blog) => (
          <div key={blog._id.toString()} className="flex gap-3">
            <Link href={`/blog/${blog.slug}`} className="flex-shrink-0">
              <div className="relative h-16 w-16 rounded overflow-hidden">
                <Image src={blog.featuredImage || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
              </div>
            </Link>
            <div>
              <Link href={`/blog/${blog.slug}`}>
                <h4 className="font-medium hover:text-primary transition-colors line-clamp-2">{blog.title}</h4>
              </Link>
              <div className="text-sm text-gray-500 mt-1">{formatDate(blog.publishedAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

