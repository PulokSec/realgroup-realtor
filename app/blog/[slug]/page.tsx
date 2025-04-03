import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogBySlug, getRelatedBlogs, IBlog } from "@/lib/models/blog"
import { formatDate } from "@/lib/utils"
import { BlogRating } from "@/components/blog/blog-rating"
import { BlogAuthor } from "@/components/blog/blog-author"
import { BlogRelated } from "@/components/blog/blog-related"
// Import the BlogContentRenderer
import { BlogContentRenderer } from "@/components/blog/blog-content-renderer"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const dynamic = "force-dynamic"

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const blog : IBlog = await getBlogBySlug(params?.slug)

  if (!blog) {
    notFound()
  }

  const relatedBlogs = await getRelatedBlogs(blog)

  return (
    <div className="min-h-screen bg-background">
              <SiteHeader />
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>

        <div className="flex items-center mb-6">
          <BlogRating rating={blog.rating} />
          <span className="mx-4 text-gray-400">|</span>
          <div className="text-sm text-gray-600">
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
        </div>

        <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={blog.featuredImage || "/placeholder.svg"}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
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
            <BlogRelated blogs={relatedBlogs} />
          </div>
        </div>
      </div>
    </div>
    <SiteFooter />
    </div>
  )
}

