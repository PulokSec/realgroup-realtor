import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { EmailList } from "@/lib/models/email-list"
import { User } from "@/lib/models/user"
import { Lead } from "@/lib/models/lead"
import { Contact } from "@/lib/models/contact"

export async function POST(req: Request) {
  try {
    await connectDB()

    const { listName, description, source = "all" } = await req.json()

    if (!listName) {
      return NextResponse.json({ error: "List name is required" }, { status: 400 })
    }

    // Collect email addresses from different sources
    const subscribers: any[] = []
    const emails = new Set<string>()

    // Function to add subscriber if email is valid and not duplicate
    const addSubscriber = (email: string, name = "", phone = "") => {
      if (email && /\S+@\S+\.\S+/.test(email) && !emails.has(email)) {
        emails.add(email)
        subscribers.push({
          email,
          name,
          phone,
          subscribed: true,
          subscribedAt: new Date(),
        })
      }
    }

    // Import from users
    if (source === "all" || source === "users") {
      const users = await User.find({ emailVerified: true })
      users.forEach((user) => {
        addSubscriber(user.email, user.fullName, user.phoneNumber)
      })
    }

    // Import from leads
    if (source === "all" || source === "leads") {
      const leads = await Lead.find()
      leads.forEach((lead) => {
        addSubscriber(lead.email, lead.fullName, lead.phoneNumber)
      })
    }

    // Import from contacts
    if (source === "all" || source === "contacts") {
      const contacts = await Contact.find()
      contacts.forEach((contact) => {
        addSubscriber(contact.email, contact.name, contact.phoneNumber || "")
      })
    }

    // Create or update email list
    let emailList = await EmailList.findOne({ name: listName })

    if (emailList) {
      // Add new subscribers to existing list
      const existingEmails = new Set(emailList.subscribers.map((s: any) => s.email))
      const newSubscribers = subscribers.filter((s: any) => !existingEmails.has(s.email))

      emailList.subscribers.push(...newSubscribers)
      emailList.subscriberCount = emailList.subscribers.length

      if (description) {
        emailList.description = description
      }

      await emailList.save()
    } else {
      // Create new list
      emailList = new EmailList({
        name: listName,
        description,
        subscribers,
        subscriberCount: subscribers.length,
        isActive: true,
      })

      await emailList.save()
    }

    return NextResponse.json({
      message: "Contacts imported successfully",
      importedCount: subscribers.length,
      listId: emailList._id,
    })
  } catch (error) {
    console.error("Error importing contacts:", error)
    return NextResponse.json({ error: "Error importing contacts" }, { status: 500 })
  }
}

