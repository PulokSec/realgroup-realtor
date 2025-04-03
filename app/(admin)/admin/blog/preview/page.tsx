"use client"

import { useEffect, useState } from "react"
import { formatDate } from "@/lib/utils"
import { BlogRating } from "@/components/blog/blog-rating"
import { BlogAuthor } from "@/components/blog/blog-author"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
// Import the BlogContentRenderer
import { BlogContentRenderer } from "@/components/blog/blog-content-renderer"

export default function BlogPreviewPage() {
  const [blog, setBlog] = useState<any>(null)

  useEffect(() => {
    const blogData = localStorage.getItem("blogPreview")
    if (blogData) {
      setBlog(JSON.parse(blogData))
    }
  }, [])

  if (!blog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No preview data found</h1>
          <p className="text-gray-600 mb-6">Please go back to the editor and click the preview button again.</p>
          <Button onClick={() => window.close()}>Close Preview</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => window.close()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md mb-6">
          This is a preview. The blog post has not been published yet.
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>

        <div className="flex items-center mb-6">
          <BlogRating rating={4.5} />
          <span className="mx-4 text-gray-400">|</span>
          <div className="text-sm text-gray-600">
            <span>{formatDate(new Date())}</span>
            {blog.category && (
              <>
                <span className="mx-2">•</span>
                <span className="hover:text-primary">{blog.category}</span>
              </>
            )}
          </div>
        </div>

        <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
          {blog.featuredImage ? (
            <img
              src={blog.featuredImage || "/placeholder.svg"}
              alt={blog.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Featured Image</span>
            </div>
          )}
        </div>

        <div className="lg:flex gap-8">
          <div className="lg:w-2/3">
            {/* Replace the content rendering section with: */}
            <div className="mt-8">
              <BlogContentRenderer content={blog.content} />
            </div>

            <BlogAuthor author={blog.author} />
          </div>

          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Related Articles</h3>
              <div className="text-gray-500 italic">Related articles will appear here when the post is published.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

