"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AuthModal } from "./auth-modal"

interface User {
  id: string
  email: string
  fullName: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
  sendVerificationCode: (email: string, fullName?: string, phoneNumber?: string) => Promise<void>
  verifyCode: (email: string, code: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("auth_token")
    if (token) {
      fetchUser(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token is invalid
        localStorage.removeItem("auth_token")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendVerificationCode = async (email: string, fullName?: string, phoneNumber?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/email-signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          fullName,
          phoneNumber,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send verification code")
      }

      return await response.json()
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async (email: string, code: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Invalid verification code")
      }

      const data = await response.json()
      localStorage.setItem("auth_token", data.token)
      document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      setUser(data.user)
      setShowAuthModal(false)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: user?.role === "admin" ? true : false,
        showAuthModal,
        setShowAuthModal,
        sendVerificationCode,
        verifyCode,
        logout,
      }}
    >
      {children}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

