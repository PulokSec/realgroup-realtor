import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { AdminWhitelist } from "@/lib/models/adminWhitelist"
import { User } from "@/lib/models/user"
import { getUserFromToken } from "@/lib/user"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const currentUser = await getUserFromToken(token)
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const adminEmails = await AdminWhitelist.find().sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      adminEmails,
    })
  } catch (error) {
    console.error("Error fetching admin whitelist:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching admin whitelist" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const currentUser = await getUserFromToken(token)
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const { email, fullName } = await req.json()

    if (!email || !fullName) {
      return NextResponse.json({ success: false, message: "Email and full name are required" }, { status: 400 })
    }

    const lowerEmail = email.toLowerCase()

    // Check if email already exists in whitelist
    const existingEmail = await AdminWhitelist.findOne({ email: lowerEmail })
    if (existingEmail) {
      return NextResponse.json({ success: false, message: "Email already exists in whitelist" }, { status: 400 })
    }

    // Add email to whitelist
    const newAdminEmail = new AdminWhitelist({
      email: lowerEmail,
      fullName,
      addedBy: currentUser.email,
    })
    await newAdminEmail.save()

    // Check if user with this email exists and update their admin status
    const user = await User.findOne({ email: lowerEmail })
    if (user) {
      if (!user.isAdmin) {
        user.isAdmin = true
        await user.save()
      }
    } else {
      // Create a new user with admin privileges
      const newUser = new User({
        email: lowerEmail,
        name: fullName,
        isAdmin: true,
      })
      await newUser.save()
    }

    return NextResponse.json({
      success: true,
      message: "Email added to admin whitelist",
      adminEmail: newAdminEmail,
    })
  } catch (error) {
    console.error("Error adding to admin whitelist:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while adding to admin whitelist" },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const currentUser = await getUserFromToken(token)
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 })
    }

    // Find the email before deleting it
    const adminEmail = await AdminWhitelist.findById(id)
    if (!adminEmail) {
      return NextResponse.json({ success: false, message: "Admin email not found" }, { status: 404 })
    }

    // Delete from whitelist
    await AdminWhitelist.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Email removed from admin whitelist",
    })
  } catch (error) {
    console.error("Error removing from admin whitelist:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while removing from admin whitelist" },
      { status: 500 },
    )
  }
}

