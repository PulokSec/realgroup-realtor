import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { EmailList } from "@/lib/models/email-list"

export async function GET(req: Request) {
  try {
    await connectDB()

    const emailLists = await EmailList.find().sort({ createdAt: -1 })

    return NextResponse.json(emailLists)
  } catch (error) {
    console.error("Error fetching email lists:", error)
    return NextResponse.json({ error: "Error fetching email lists" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()

    const { name, description } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "List name is required" }, { status: 400 })
    }

    const newList = new EmailList({
      name,
      description,
      subscribers: [],
      subscriberCount: 0,
      isActive: true,
    })

    await newList.save()

    return NextResponse.json(newList, { status: 201 })
  } catch (error) {
    console.error("Error creating email list:", error)
    return NextResponse.json({ error: "Error creating email list" }, { status: 500 })
  }
}

