import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Settings } from "@/lib/models/settings"

export async function GET(req: Request) {
  try {
    await connectDB()

    // Get Mailchimp settings from database
    const mailchimpSettings = await Settings.findOne({ key: "mailchimp" })

    if (!mailchimpSettings || !mailchimpSettings.value.apiKey || !mailchimpSettings.value.datacenter) {
      return NextResponse.json({ error: "Mailchimp not connected" }, { status: 400 })
    }

    const { apiKey, datacenter } = mailchimpSettings.value

    // Fetch campaigns from Mailchimp API
    const response = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/campaigns?count=10`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch Mailchimp campaigns" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({ campaigns: data.campaigns || [] })
  } catch (error) {
    console.error("Error fetching Mailchimp campaigns:", error)
    return NextResponse.json({ error: "Error fetching Mailchimp campaigns" }, { status: 500 })
  }
}

