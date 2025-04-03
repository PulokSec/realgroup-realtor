import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { EmailTemplate } from "@/lib/models/email-template"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const emailTemplate = await EmailTemplate.findById(id)

    if (!emailTemplate) {
      return NextResponse.json({ error: "Email template not found" }, { status: 404 })
    }

    return NextResponse.json(emailTemplate)
  } catch (error) {
    console.error("Error fetching email template:", error)
    return NextResponse.json({ error: "Error fetching email template" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const { name, content } = await req.json()

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 })
    }

    const emailTemplate = await EmailTemplate.findById(id)

    if (!emailTemplate) {
      return NextResponse.json({ error: "Email template not found" }, { status: 404 })
    }

    emailTemplate.name = name
    emailTemplate.content = content
    emailTemplate.updatedAt = new Date()

    await emailTemplate.save()

    return NextResponse.json(emailTemplate)
  } catch (error) {
    console.error("Error updating email template:", error)
    return NextResponse.json({ error: "Error updating email template" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const result = await EmailTemplate.findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ error: "Email template not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Email template deleted successfully" })
  } catch (error) {
    console.error("Error deleting email template:", error)
    return NextResponse.json({ error: "Error deleting email template" }, { status: 500 })
  }
}

