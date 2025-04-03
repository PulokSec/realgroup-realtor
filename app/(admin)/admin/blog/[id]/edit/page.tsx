import { notFound } from "next/navigation"
import { BlogEditor } from "@/components/admin/blog-editor"
import { Blog, IBlog } from "@/lib/models/blog"
import connectDB from "@/lib/db"
import AdminLayout from "../../../layout"

export const dynamic = "force-dynamic"

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  await connectDB()
const { id } = await params
  // Fetch the blog and convert to plain JavaScript object
  const blog = await Blog.findById(id).lean()

  if (!blog) {
    notFound()
  }

  // Serialize the blog document
  const serializedBlog = JSON.parse(JSON.stringify(blog)) as IBlog

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
        <BlogEditor blog={serializedBlog} />
      </div>
    </AdminLayout>
  )
}