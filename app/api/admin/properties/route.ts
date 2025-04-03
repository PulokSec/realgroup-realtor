import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Property } from "@/lib/models/property"

export async function GET(req: Request) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const filter = url.searchParams.get("filter") || "all"
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { "properties.street_address": { $regex: search, $options: "i" } },
        { "properties.listing_id": { $regex: search, $options: "i" } },
      ]
    }

    if (filter === "custom") {
      query["properties.isCustom"] = true
    } else if (filter === "imported") {
      query["properties.isCustom"] = false
    }

    // Get total count for pagination
    const total = await Property.countDocuments(query)

    // Get properties
    const properties = await Property.find(query).sort({ "properties.createdAt": -1 }).skip(skip).limit(limit)

    return NextResponse.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalProperties: total,
    })
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json({ error: "Error fetching properties" }, { status: 500 })
  }
}

