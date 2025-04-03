import { type NextRequest, NextResponse } from "next/server"
import connectToDB  from "@/lib/db"
import { User } from "@/lib/models/user"
import { AdminWhitelist } from "@/lib/models/adminWhitelist"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  try {
    await connectToDB()
    const { email, redirect } = await req.json()
    const lowerEmail = email.toLowerCase()

    // Find user by email
    let user = await User.findOne({ email: lowerEmail })

    // Check if email is in admin whitelist
    const isWhitelisted = await AdminWhitelist.findOne({ email: lowerEmail })

    // If email is whitelisted but user doesn't exist, create a new admin user
    if (isWhitelisted && !user) {
      user = new User({
        email: lowerEmail,
        name: isWhitelisted.fullName,
        isAdmin: true,
        role: "admin",
      })
      await user.save()
    }

    // If user doesn't exist and not whitelisted, return error
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // If email is whitelisted, ensure user has admin privileges
    if (isWhitelisted && !user.isAdmin) {
      user.isAdmin = true
      await user.save()
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: true,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    )

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully",
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: true,
        role: user.role,
      },
      redirect: redirect || (user.isAdmin ? "/admin" : "/"),
    })

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during sign in" }, { status: 500 })
  }
}

