import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Blog } from "@/lib/models/blog"
import { getUserFromToken } from "@/lib/user"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const blog = await Blog.findById(params.id).lean()

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json({ blog })
  } catch (error) {
    console.error("Error fetching blog:", error)
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Set published date if publishing for the first time
    if (data.published && !data.publishedAt) {
      data.publishedAt = new Date()
    }

    const blog = await Blog.findByIdAndUpdate(params.id, data, { new: true })

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json({ blog })
  } catch (error) {
    console.error("Error updating blog:", error)
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blog = await Blog.findByIdAndDelete(params.id)

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting blog:", error)
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}

