import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Property } from "@/lib/models/property"

export async function POST(req: Request) {
  try {
    await connectDB()

    const data = await req.json()

    // Validate required fields
    if (!data.properties || !data.geometry) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure isCustom is set to true
    if (data.properties) {
      data.properties.isCustom = true
    }

    // Create new property
    const property = await Property.create(data)

    return NextResponse.json({
      message: "Custom property created successfully",
      property,
    })
  } catch (error) {
    console.error("Error creating custom property:", error)
    return NextResponse.json({ error: "Error creating custom property" }, { status: 500 })
  }
}

