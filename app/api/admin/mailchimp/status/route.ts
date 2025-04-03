import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Settings } from "@/lib/models/settings"

export async function GET(req: Request) {
  try {
    await connectDB()

    // Get Mailchimp settings from database
    const mailchimpSettings = await Settings.findOne({ key: "mailchimp" })

    if (!mailchimpSettings || !mailchimpSettings.value.apiKey) {
      return NextResponse.json({ connected: false })
    }

    return NextResponse.json({
      connected: true,
      apiKey: mailchimpSettings.value.apiKey.substring(0, 4) + "••••••••••••••••••••••",
    })
  } catch (error) {
    console.error("Error checking Mailchimp status:", error)
    return NextResponse.json({ error: "Error checking Mailchimp status" }, { status: 500 })
  }
}

