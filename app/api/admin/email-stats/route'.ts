import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { EmailCampaign } from "@/lib/models/email-campaign"

export async function GET(req: Request) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const timeRange = url.searchParams.get("timeRange") || "7days"

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "7days":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "30days":
        startDate.setDate(endDate.getDate() - 30)
        break
      case "90days":
        startDate.setDate(endDate.getDate() - 90)
        break
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 7)
    }

    // Get campaigns in date range
    const campaigns = await EmailCampaign.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ["sent", "completed"] },
    })

    // Calculate summary stats
    const summary = {
      totalSent: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
    }

    campaigns.forEach((campaign) => {
      summary.totalSent += campaign.stats.sent
      summary.opened += campaign.stats.opened
      summary.clicked += campaign.stats.clicked
      summary.bounced += campaign.stats.bounced
      summary.unsubscribed += campaign.stats.unsubscribed
    })

    // For now, return mock data for charts
    // In a real implementation, you would aggregate data from your campaigns
    return NextResponse.json({
      summary,
      campaigns,
      // Additional mock data would be added here for charts
    })
  } catch (error) {
    console.error("Error fetching email stats:", error)
    return NextResponse.json({ error: "Error fetching email stats" }, { status: 500 })
  }
}

