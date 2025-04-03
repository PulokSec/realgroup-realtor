import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { EmailTemplate } from "@/lib/models/email-template"

export async function GET(req: Request) {
  try {
    await connectDB()

    const emailTemplates = await EmailTemplate.find().sort({ createdAt: -1 })

    return NextResponse.json(emailTemplates)
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json({ error: "Error fetching email templates" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()

    const { name, content } = await req.json()

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 })
    }

    const newTemplate = new EmailTemplate({
      name,
      content,
    })

    await newTemplate.save()

    return NextResponse.json(newTemplate, { status: 201 })
  } catch (error) {
    console.error("Error creating email template:", error)
    return NextResponse.json({ error: "Error creating email template" }, { status: 500 })
  }
}

