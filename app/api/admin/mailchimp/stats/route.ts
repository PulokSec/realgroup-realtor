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

    // Fetch lists to calculate overall stats
    const response = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/lists?count=100`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch Mailchimp lists" }, { status: response.status })
    }

    const data = await response.json()
    const lists = data.lists || []

    // Calculate overall stats
    let totalSubscribers = 0
    let totalOpenRate = 0
    let totalClickRate = 0
    let listCount = 0

    lists.forEach((list: any) => {
      if (list.stats) {
        totalSubscribers += list.stats.member_count || 0
        totalOpenRate += list.stats.open_rate || 0
        totalClickRate += list.stats.click_rate || 0
        listCount++
      }
    })

    const stats = {
      total_subscribers: totalSubscribers,
      avg_open_rate: listCount > 0 ? totalOpenRate / listCount : 0,
      avg_click_rate: listCount > 0 ? totalClickRate / listCount : 0,
      list_count: listCount,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching Mailchimp stats:", error)
    return NextResponse.json({ error: "Error fetching Mailchimp stats" }, { status: 500 })
  }
}

