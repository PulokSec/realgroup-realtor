import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { EmailCampaign } from "@/lib/models/email-campaign"
import { EmailList } from "@/lib/models/email-list"

export async function GET(req: Request) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const status = url.searchParams.get("status")

    const query: any = {}
    if (status) {
      query.status = status
    }

    const emailCampaigns = await EmailCampaign.find(query).sort({ createdAt: -1 })

    return NextResponse.json(emailCampaigns)
  } catch (error) {
    console.error("Error fetching email campaigns:", error)
    return NextResponse.json({ error: "Error fetching email campaigns" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()

    const { subject, listId, content, scheduledFor } = await req.json()

    if (!subject || !listId || !content) {
      return NextResponse.json({ error: "Subject, list ID, and content are required" }, { status: 400 })
    }

    // Verify that the list exists
    const emailList = await EmailList.findById(listId)
    if (!emailList && listId !== "all" && listId !== "leads" && listId !== "users") {
      return NextResponse.json({ error: "Email list not found" }, { status: 404 })
    }

    const newCampaign = new EmailCampaign({
      subject,
      listId,
      content,
      status: scheduledFor ? "scheduled" : "draft",
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      },
    })

    await newCampaign.save()

    return NextResponse.json(newCampaign, { status: 201 })
  } catch (error) {
    console.error("Error creating email campaign:", error)
    return NextResponse.json({ error: "Error creating email campaign" }, { status: 500 })
  }
}

