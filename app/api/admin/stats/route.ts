import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { Contact } from "@/lib/models/contact"
import { Notification } from "@/lib/models/notification"
import { Lead } from "@/lib/models/lead"

export async function GET(req: Request) {
  try {
    await connectDB()

    // Count documents in each collection
    const usersCount = await User.countDocuments()
    const messagesCount = await Contact.countDocuments()
    const notificationsCount = await Notification.countDocuments()
    const leadsCount = await Lead.countDocuments()

    // Mock data for properties and views (would come from actual property model)
    const propertiesCount = 125
    const viewsCount = 15782

    return NextResponse.json({
      users: usersCount,
      messages: messagesCount,
      notifications: notificationsCount,
      leads: leadsCount,
      properties: propertiesCount,
      views: viewsCount,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Error fetching stats" }, { status: 500 })
  }
}

