import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const COOKIE_NAME = "auth_token"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function createToken(userId: string, role = "user") {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: "30d",
  })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role?: string; email?: string ; isAdmin?: boolean }
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getAuthCookie() {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

