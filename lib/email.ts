import nodemailer from "nodemailer"
import connectDB from "@/lib/db"
import { VerificationCode } from "@/lib/models/verification-code"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationEmail(email: string, code: string) {
  // Connect to database
  await connectDB()

  // Store code with 15-minute expiration
  const expiryDate = new Date(Date.now() + 15 * 60 * 1000)

  // Delete any existing codes for this email
  await VerificationCode.deleteMany({ email })

  // Create new verification code
  await VerificationCode.create({
    email,
    code,
    expires: expiryDate,
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Verification Code</h2>
        <p>Use the following code to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
          ${code}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `,
  })
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  // Connect to database
  await connectDB()

  // Find the verification code
  const verificationCode = await VerificationCode.findOne({
    email,
    code,
    expires: { $gt: new Date() },
  })

  if (!verificationCode) return false

  // Code is valid, remove it to prevent reuse
  await VerificationCode.deleteOne({ _id: verificationCode._id })

  return true
}

