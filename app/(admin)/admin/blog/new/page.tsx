import { BlogEditor } from "@/components/admin/blog-editor"
import AdminLayout from "../../layout"

export default function NewBlogPage() {
  return (
    <AdminLayout>
        <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Blog Post</h1>
      <BlogEditor />
    </div>
    </AdminLayout>
  )
}

