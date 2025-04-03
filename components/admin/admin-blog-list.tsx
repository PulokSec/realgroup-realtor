"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import type { IBlog } from "@/lib/models/blog"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { Edit, MoreVertical, Eye, Trash, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminBlogList({ blogs }: { blogs: IBlog[] }) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/blog/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete blog post")
      }

      toast({
        title: "Blog post deleted",
        description: "The blog post has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/blog/${id}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update blog status")
      }

      toast({
        title: currentStatus ? "Blog unpublished" : "Blog published",
        description: `The blog post has been ${currentStatus ? "unpublished" : "published"} successfully.`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update blog status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-medium">No blog posts found</h3>
        <p className="text-gray-600 mt-2">Try adjusting your search or filter criteria</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog._id.toString()}>
                <TableCell>
                  <div className="relative h-12 w-16 rounded overflow-hidden">
                    <Image
                      src={blog.featuredImage || "/placeholder.svg"}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{blog.title}</TableCell>
                <TableCell>{blog.category}</TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      blog.published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {blog.published ? "Published" : "Draft"}
                  </div>
                </TableCell>
                <TableCell>{formatDate(blog.publishedAt || blog.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/blog/${blog.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/blog/${blog._id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePublishToggle(blog._id.toString(), blog.published)}>
                        {blog.published ? (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(blog._id.toString())} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

