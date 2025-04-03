import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Property } from "@/lib/models/property"

export async function GET(req: Request) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const limit = Number.parseInt(url.searchParams.get("limit") || "12")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const minPrice = url.searchParams.get("minPrice")
    const maxPrice = url.searchParams.get("maxPrice")
    const bedrooms = url.searchParams.get("bedrooms")
    const propertyType = url.searchParams.get("type")
    const skip = (page - 1) * limit

    // Build query
    let query: any = {}

    if (search) {
      query = {
        $or: [
          { "properties.street_address": { $regex: search, $options: "i" } },
          { "properties.city": { $regex: search, $options: "i" } },
          { "properties.postal_code": { $regex: search, $options: "i" } },
        ],
      }
    }

    // Add price filter
    if (minPrice || maxPrice) {
      query["properties.price"] = {}
      if (minPrice) {
        query["properties.price"].$gte = minPrice
      }
      if (maxPrice) {
        query["properties.price"].$lte = maxPrice
      }
    }

    // Add bedrooms filter
    if (bedrooms) {
      query["properties.bedrooms_total"] = { $gte: bedrooms }
    }

    // Add property type filter
    if (propertyType && propertyType !== "all") {
      query["properties.type"] = propertyType
    }

    // Get total count for pagination
    const totalCount = await Property.countDocuments(query)

    // Get properties
    const properties = await Property.find(query).sort({ "properties.createdAt": -1 }).skip(skip).limit(limit)

    // Format as GeoJSON FeatureCollection
    const featureCollection = {
      type: "FeatureCollection",
      features: properties,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    }

    return NextResponse.json(featureCollection)
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json({ error: "Error fetching properties" }, { status: 500 })
  }
}

