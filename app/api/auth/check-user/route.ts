import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const email = url.searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })

    return NextResponse.json({
      exists: !!user,
    })
  } catch (error) {
    console.error("Check user error:", error)
    return NextResponse.json({ error: "Error checking user" }, { status: 500 })
  }
}

