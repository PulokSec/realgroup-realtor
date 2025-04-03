import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Property } from "@/lib/models/property"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params

    // Delete property
    const result = await Property.findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Property deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json({ error: "Error deleting property" }, { status: 500 })
  }
}

