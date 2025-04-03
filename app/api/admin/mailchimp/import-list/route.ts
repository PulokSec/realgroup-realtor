import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Settings } from "@/lib/models/settings"
import { EmailList } from "@/lib/models/email-list"

export async function POST(req: Request) {
  try {
    await connectDB()

    const { listId } = await req.json()

    if (!listId) {
      return NextResponse.json({ error: "List ID is required" }, { status: 400 })
    }

    // Get Mailchimp settings from database
    const mailchimpSettings = await Settings.findOne({ key: "mailchimp" })

    if (!mailchimpSettings || !mailchimpSettings.value.apiKey || !mailchimpSettings.value.datacenter) {
      return NextResponse.json({ error: "Mailchimp not connected" }, { status: 400 })
    }

    const { apiKey, datacenter } = mailchimpSettings.value

    // Fetch list details from Mailchimp API
    const listResponse = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/lists/${listId}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
      },
    })

    if (!listResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch Mailchimp list" }, { status: listResponse.status })
    }

    const listData = await listResponse.json()

    // Fetch members from Mailchimp API
    const membersResponse = await fetch(
      `https://${datacenter}.api.mailchimp.com/3.0/lists/${listId}/members?count=1000`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
        },
      },
    )

    if (!membersResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch Mailchimp list members" }, { status: membersResponse.status })
    }

    const membersData = await membersResponse.json()
    const members = membersData.members || []

    // Convert members to subscribers format
    const subscribers = members
      .filter((member: any) => member.status !== "unsubscribed" && member.status !== "cleaned")
      .map((member: any) => ({
        email: member.email_address,
        name: `${member.merge_fields.FNAME || ""} ${member.merge_fields.LNAME || ""}`.trim(),
        phone: member.merge_fields.PHONE || "",
        subscribed: true,
        subscribedAt: new Date(member.timestamp_signup || Date.now()),
      }))

    // Create or update email list
    let emailList = await EmailList.findOne({ "value.mailchimpId": listId })

    if (emailList) {
      // Add new subscribers to existing list
      const existingEmails = new Set(emailList.subscribers.map((s: any) => s.email))
      const newSubscribers = subscribers.filter((s: any) => !existingEmails.has(s.email))

      emailList.subscribers.push(...newSubscribers)
      emailList.subscriberCount = emailList.subscribers.length
      emailList.value.mailchimpSyncedAt = new Date()

      await emailList.save()
    } else {
      // Create new list
      emailList = new EmailList({
        name: `${listData.name} (Mailchimp)`,
        description: `Imported from Mailchimp: ${listData.name}`,
        subscribers,
        subscriberCount: subscribers.length,
        isActive: true,
        value: {
          mailchimpId: listId,
          mailchimpName: listData.name,
          mailchimpSyncedAt: new Date(),
        },
      })

      await emailList.save()
    }

    return NextResponse.json({
      message: "List imported successfully",
      importedCount: subscribers.length,
      listId: emailList._id,
    })
  } catch (error) {
    console.error("Error importing Mailchimp list:", error)
    return NextResponse.json({ error: "Error importing Mailchimp list" }, { status: 500 })
  }
}

