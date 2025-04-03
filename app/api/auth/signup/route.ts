import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { createToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    await connectDB()

    const { email, password, firstName, lastName } = await req.json()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
    })

    await user.save()

    // Create JWT token
    const token = createToken(user._id)

    return NextResponse.json(
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isAdmin: user.isAdmin,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Error creating user" }, { status: 500 })
  }
}

