import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { EmailList } from "@/lib/models/email-list"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const emailList = await EmailList.findById(id)

    if (!emailList) {
      return NextResponse.json({ error: "Email list not found" }, { status: 404 })
    }

    return NextResponse.json(emailList)
  } catch (error) {
    console.error("Error fetching email list:", error)
    return NextResponse.json({ error: "Error fetching email list" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const { name, description, isActive } = await req.json()

    const emailList = await EmailList.findById(id)

    if (!emailList) {
      return NextResponse.json({ error: "Email list not found" }, { status: 404 })
    }

    if (name) emailList.name = name
    if (description !== undefined) emailList.description = description
    if (isActive !== undefined) emailList.isActive = isActive

    await emailList.save()

    return NextResponse.json(emailList)
  } catch (error) {
    console.error("Error updating email list:", error)
    return NextResponse.json({ error: "Error updating email list" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const result = await EmailList.findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ error: "Email list not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Email list deleted successfully" })
  } catch (error) {
    console.error("Error deleting email list:", error)
    return NextResponse.json({ error: "Error deleting email list" }, { status: 500 })
  }
}

