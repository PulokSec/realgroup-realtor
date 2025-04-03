import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { EmailList } from "@/lib/models/email-list"
import { parse } from "csv-parse"

export async function POST(req: Request) {
  try {
    await connectDB()

    const formData = await req.formData()
    const file = formData.get("file") as File
    const listName = formData.get("listName") as string
    const description = formData.get("description") as string

    if (!file || !listName) {
      return NextResponse.json({ error: "File and list name are required" }, { status: 400 })
    }

    // Read and parse CSV file
    const fileContent = await file.text()
    const records: any[] = await new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (err, output) => {
        if (err) reject(err)
        else resolve(output)
      })
    })

    // Extract email addresses
    const subscribers = records
      .map((record: any) => {
        return {
          email: record.email,
          name: record.name || "",
          phone: record.phone || "",
          subscribed: true,
          subscribedAt: new Date(),
        }
      })
      .filter((subscriber: any) => subscriber.email && /\S+@\S+\.\S+/.test(subscriber.email))

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
      message: "File uploaded successfully",
      importedCount: subscribers.length,
      listId: emailList._id,
    })
  } catch (error) {
    console.error("Error uploading email list:", error)
    return NextResponse.json({ error: "Error uploading email list" }, { status: 500 })
  }
}

