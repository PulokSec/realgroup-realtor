import { verifyToken } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
/**
 * Get user from token
 * @param token JWT token
 * @returns User object or null
 */
export async function getUserFromToken(token: string) {
  try {
    // Verify token
    const payload = verifyToken(token)
    if (!payload) return null

    // Connect to database
    await connectDB()

    // Find user - make sure User model is defined
    try {
      const user = await User.findById(payload.userId)
      if (!user) return null

      return {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isAdmin: user.isAdmin,
      }
    } catch (error) {
      console.error("Error finding user:", error)
      return null
    }
  } catch (error) {
    console.error("Error getting user from token:", error)
    return null
  }
}


