import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Contact } from "@/lib/models/contact"
import { Lead } from "@/lib/models/lead"

export async function POST(req: Request) {
  try {
    await connectDB()

    const { name, email, phone, message } = await req.json()

    // Create contact entry
    const contact = await Contact.create({
      name,
      email,
      phoneNumber: phone,
      message,
      status: "new",
    })

    // Create lead entry
    const lead = await Lead.create({
      fullName: name,
      email,
      phoneNumber: phone,
      source: "contact_form",
      status: "new",
      notes: message,
    })

    return NextResponse.json({
      message: "Contact form submitted successfully",
      contact: contact._id,
      lead: lead._id,
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Error submitting contact form" }, { status: 500 })
  }
}

