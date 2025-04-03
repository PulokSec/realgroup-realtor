import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Property } from "@/lib/models/property"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = await params
    // Find property by listing_id or id
    const property = await Property.findOne({
      "properties.listing_id": id
    })
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json({ error: "Error fetching property" }, { status: 500 })
  }
}

