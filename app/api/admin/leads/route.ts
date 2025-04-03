import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Lead } from "@/lib/models/lead"

export async function GET(req: Request) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const search = url.searchParams.get("search")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (status && status !== "all") {
      query.status = status
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count for pagination
    const total = await Lead.countDocuments(query)

    // Get leads
    const leads = await Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    return NextResponse.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalLeads: total,
    })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: "Error fetching leads" }, { status: 500 })
  }
}

