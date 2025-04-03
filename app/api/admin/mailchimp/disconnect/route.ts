import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Settings } from "@/lib/models/settings"

export async function POST(req: Request) {
  try {
    await connectDB()

    // Remove Mailchimp settings from database
    await Settings.findOneAndUpdate(
      { key: "mailchimp" },
      {
        key: "mailchimp",
        value: {
          connected: false,
          disconnectedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error disconnecting from Mailchimp:", error)
    return NextResponse.json({ error: "Error disconnecting from Mailchimp" }, { status: 500 })
  }
}

