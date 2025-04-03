import Link from "next/link";
import { getBlogs } from "@/lib/models/blog";
import { Button } from "@/components/ui/button";
import { AdminBlogList } from "@/components/admin/admin-blog-list";
import { AdminBlogFilters } from "@/components/admin/admin-blog-filters";
import { Pagination } from "@/components/blog/pagination";
import { Plus } from "lucide-react";
import AdminLayout from "../layout";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
    published?: string;
  };
}) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1;
  const category = searchParams.category || "";
  const search = searchParams.search || "";
  const published = searchParams.published === "false" ? false : true;

  // Fetch data and serialize blogs
  const result = await getBlogs({
    page,
    category,
    search,
    published: searchParams.published === undefined ? undefined : published,
  });

  // Convert blogs to plain objects
  const blogs = JSON.parse(JSON.stringify(result.blogs));
  const { pagination } = result;
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <Link href="/admin/blog/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Blog Post
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <AdminBlogFilters />
        </div>

        <AdminBlogList blogs={blogs} />

        <div className="mt-6">
          <Pagination pagination={pagination} />
        </div>
      </div>
    </AdminLayout>
  );
}
