import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Notification } from "@/lib/models/notification"

export async function GET(req: Request) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const type = url.searchParams.get("type")
    const read = url.searchParams.get("read")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (type && type !== "all") {
      query.type = type
    }

    if (read === "true") {
      query.read = true
    } else if (read === "false") {
      query.read = false
    }

    // Get total count for pagination
    const total = await Notification.countDocuments(query)

    // Get notifications
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    return NextResponse.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalNotifications: total,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Error fetching notifications" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()

    const { userId, type, title, message } = await req.json()

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: "User ID, type, title, and message are required" }, { status: 400 })
    }

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      read: false,
    })

    await notification.save()

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Error creating notification" }, { status: 500 })
  }
}

