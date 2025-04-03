import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Blog } from "@/lib/models/blog"
import {  getUserFromToken } from "@/lib/user"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category") || ""
    const search = searchParams.get("search") || ""
    const published = searchParams.get("published") === "false" ? false : true

    const skip = (page - 1) * limit

    const query: any = {}

    if (category) {
      query.category = category
    }

    if (search) {
      query.$text = { $search: search }
    }

    if (searchParams.has("published")) {
      query.published = published
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    const total = await Blog.countDocuments(query)

    return NextResponse.json({
      blogs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Generate a slug if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
    }

    // Set published date if publishing
    if (data.published) {
      data.publishedAt = new Date()
    }

    const blog = new Blog(data)
    await blog.save()

    return NextResponse.json({ blog }, { status: 201 })
  } catch (error) {
    console.error("Error creating blog:", error)
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 })
  }
}

