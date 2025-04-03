import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Blog } from "@/lib/models/blog"
import { getUserFromToken } from "@/lib/user"
import { cookies } from "next/headers"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { published } = await request.json()

    const updateData: any = { published }

    // Set published date if publishing for the first time
    if (published) {
      updateData.publishedAt = new Date()
    }

    const blog = await Blog.findByIdAndUpdate(params.id, updateData, { new: true })

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json({ blog })
  } catch (error) {
    console.error("Error updating blog publish status:", error)
    return NextResponse.json({ error: "Failed to update blog publish status" }, { status: 500 })
  }
}

