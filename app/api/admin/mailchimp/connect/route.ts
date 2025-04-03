import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Settings } from "@/lib/models/settings"

export async function POST(req: Request) {
  try {
    await connectDB()

    const { apiKey } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Validate API key by making a test request to Mailchimp API
    const [, datacenter] = apiKey.includes("-") ? apiKey.split("-") : [null, "us1"]

    if (!datacenter) {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 400 })
    }

    const response = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 400 })
    }

    // Save API key to database
    await Settings.findOneAndUpdate(
      { key: "mailchimp" },
      {
        key: "mailchimp",
        value: {
          apiKey,
          datacenter,
          connected: true,
          connectedAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error connecting to Mailchimp:", error)
    return NextResponse.json({ error: "Error connecting to Mailchimp" }, { status: 500 })
  }
}

