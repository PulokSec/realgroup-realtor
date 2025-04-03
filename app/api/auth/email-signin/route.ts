import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { Lead } from "@/lib/models/lead"
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    await connectDB()
    const { email, fullName, phoneNumber } = await req.json()

    // Find existing user
    let user = await User.findOne({ email })

    // If new user with complete profile info
    if (!user && fullName && phoneNumber) {
      // Create new user
      user = new User({
        email,
        fullName,
        phoneNumber,
        emailVerified: false,
      })
      await user.save()

      // Also create a lead
      const lead = new Lead({
        fullName,
        email,
        phoneNumber,
        source: "website signup",
        status: "new",
      })
      await lead.save()
    }

    // If user exists or was just created
    if (user) {
      // Generate and send verification code
      const verificationCode = generateVerificationCode()
      await sendVerificationEmail(email, verificationCode)

      return NextResponse.json({
        message: "Verification code sent",
        email,
      })
    } else {
      // Email exists but no profile info provided
      return NextResponse.json({
        message: "Profile information required",
        requiresProfile: true,
      })
    }
  } catch (error) {
    console.error("Email signin error:", error)
    return NextResponse.json({ error: "Error during email signin" }, { status: 500 })
  }
}

