import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Property } from "@/lib/models/property"

export async function GET(req: Request) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const swLng = Number.parseFloat(url.searchParams.get("swLng") || "0")
    const swLat = Number.parseFloat(url.searchParams.get("swLat") || "0")
    const neLng = Number.parseFloat(url.searchParams.get("neLng") || "0")
    const neLat = Number.parseFloat(url.searchParams.get("neLat") || "0")

    // Get filter parameters
    const minPrice = url.searchParams.get("minPrice")
    const maxPrice = url.searchParams.get("maxPrice")
    const bedrooms = url.searchParams.get("bedrooms")
    const propertyType = url.searchParams.get("type")

    // Build query for properties within bounds
    const query: any = {
      "geometry.coordinates.0": { $gte: swLng, $lte: neLng },
      "geometry.coordinates.1": { $gte: swLat, $lte: neLat },
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
    if (bedrooms && bedrooms !== "any") {
      query["properties.bedrooms_total"] = { $gte: bedrooms }
    }

    // Add property type filter
    if (propertyType && propertyType !== "any") {
      query["properties.type"] = propertyType
    }

    // Get total count for pagination
    const totalCount = await Property.countDocuments(query)

    // Get properties
    const properties = await Property.find(query)

    // Format as GeoJSON FeatureCollection
    const featureCollection = {
      type: "FeatureCollection",
      features: properties,
      totalCount,
    }

    return NextResponse.json(featureCollection)
  } catch (error) {
    console.error("Error fetching properties in bounds:", error)
    return NextResponse.json({ error: "Error fetching properties in bounds" }, { status: 500 })
  }
}

