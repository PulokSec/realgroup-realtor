import mongoose, { Schema, type Document } from "mongoose"
import connectDB  from "@/lib/db"

// Add this interface if it doesn't exist already

export interface IBlog {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string // This will store JSON stringified content
  featuredImage: string
  category: string
  tags: string[]
  author: {
    name: string
    image: string
    bio: string
  }
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IBlog extends Document {
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  category: string
  tags: string[]
  author: {
    name: string
    image: string
    bio: string
  }
  rating: number
  published: boolean
  publishedAt: Date
  createdAt: Date
  updatedAt: Date
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    featuredImage: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    author: {
      name: { type: String, required: true },
      image: { type: String, required: true },
      bio: { type: String, required: true },
    },
    rating: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true },
)

// Create text index for search functionality
BlogSchema.index({ title: "text", content: "text", excerpt: "text", tags: "text" })

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema)

export async function getBlogs({
  page = 1,
  limit = 9,
  category = "",
  search = "",
  tag = "",
  published = true,
}: {
  page?: number
  limit?: number
  category?: string
  search?: string
  tag?: string
  published?: boolean
}) {
  await connectDB()

  const skip = (page - 1) * limit

  const query: any = { published }

  if (category) {
    query.category = category
  }

  if (tag) {
    query.tags = tag
  }

  if (search) {
    query.$text = { $search: search }
  }

  const blogs = await Blog.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean()

  const total = await Blog.countDocuments(query)

  return {
    blogs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function getBlogBySlug(slug: string) {
  await connectDB()

  const blog = await Blog.findOne({ slug }).lean()

  return blog
}

export async function getRelatedBlogs(blog: IBlog, limit = 3) {
  await connectDB()

  const relatedBlogs = await Blog.find({
    _id: { $ne: blog._id },
    category: blog.category,
    published: true,
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean()

  return relatedBlogs
}

export async function getBlogCategories() {
  await connectDB()

  const categories = await Blog.distinct("category", { published: true })

  return categories
}

export async function getBlogTags() {
  await connectDB()

  const tags = await Blog.distinct("tags", { published: true })

  return tags
}

