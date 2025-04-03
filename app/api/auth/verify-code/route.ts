import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { createToken } from "@/lib/auth"
import { verifyCode } from "@/lib/email"

export async function POST(req: Request) {
  try {
    await connectDB()
    const { email, code } = await req.json()

    // Verify the code
    const isValid = await verifyCode(email, code)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Update user
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.emailVerified = true
    user.lastLogin = new Date()
    await user.save()

    // Create JWT token with role
    const token = createToken(user._id, user.role)

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Code verification error:", error)
    return NextResponse.json({ error: "Error during code verification" }, { status: 500 })
  }
}

