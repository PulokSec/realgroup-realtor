import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Notification } from "@/lib/models/notification"
import { User } from "@/lib/models/user"

export async function POST(req: Request) {
  try {
    await connectDB()

    const { type, title, message, userIds } = await req.json()

    if (!type || !title || !message) {
      return NextResponse.json({ error: "Type, title, and message are required" }, { status: 400 })
    }

    let users = []

    // If specific userIds are provided, send to those users
    if (userIds && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } })
    } else {
      // Otherwise, send to all users
      users = await User.find()
    }

    // Create notifications for each user
    const notifications = []
    for (const user of users) {
      const notification = new Notification({
        userId: user._id,
        type,
        title,
        message,
        read: false,
      })
      await notification.save()
      notifications.push(notification)
    }

    return NextResponse.json({
      message: "Notifications sent successfully",
      count: notifications.length,
    })
  } catch (error) {
    console.error("Error sending notifications:", error)
    return NextResponse.json({ error: "Error sending notifications" }, { status: 500 })
  }
}

