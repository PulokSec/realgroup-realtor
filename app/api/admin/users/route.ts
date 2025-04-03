import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"

export async function GET(req: Request) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const role = url.searchParams.get("role")
    const search = url.searchParams.get("search")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (role && role !== "all") {
      query.role = role
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count for pagination
    const total = await User.countDocuments(query)

    // Get users
    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

    return NextResponse.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalUsers: total,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 })
  }
}

