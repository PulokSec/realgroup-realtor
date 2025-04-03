import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Property } from "@/lib/models/property"

export async function POST(req: Request) {
  try {
    await connectDB()

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileContents = await file.text()
    let geoJson

    try {
      geoJson = JSON.parse(fileContents)
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 })
    }

    // Validate GeoJSON format
    if (!geoJson.type || !geoJson.features || !Array.isArray(geoJson.features)) {
      return NextResponse.json({ error: "Invalid GeoJSON format" }, { status: 400 })
    }

    // Process features
    const features = geoJson.features
    let imported = 0
    let errors = 0

    for (const feature of features) {
      try {
        // Check if property already exists
        const existingProperty = await Property.findOne({
          "properties.id": feature.properties.id,
        })

        if (existingProperty) {
          // Update existing property
          await Property.updateOne({ "properties.id": feature.properties.id }, { $set: feature })
        } else {
          // Create new property
          await Property.create(feature)
        }

        imported++
      } catch (error) {
        console.error("Error importing property:", error)
        errors++
      }
    }

    return NextResponse.json({
      message: "Import completed",
      imported,
      errors,
      total: features.length,
    })
  } catch (error) {
    console.error("Error uploading properties:", error)
    return NextResponse.json({ error: "Error uploading properties" }, { status: 500 })
  }
}

