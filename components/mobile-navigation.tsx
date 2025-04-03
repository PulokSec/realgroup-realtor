"use client"

import { X, Home, Search, Heart, Bell, User, LogOut, Settings, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface MobileNavigationProps {
  onClose: () => void
}

export function MobileNavigation({ onClose }: MobileNavigationProps) {
  const { user, isAuthenticated, isAdmin, setShowAuthModal, logout } = useAuth()

  const handleLogin = () => {
    setShowAuthModal(true)
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  // Get first letter of user's name for avatar
  const getInitial = () => {
    if (!user?.fullName) return "U"
    return user.fullName.charAt(0).toUpperCase()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between py-4">
        <h2 className="text-xl font-bold">Menu</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {isAuthenticated ? (
        <div className="flex items-center gap-4 p-4 border-b">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={isAdmin ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"}>
              {getInitial()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.fullName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b">
          <Button className="w-full" onClick={handleLogin}>
            Sign In
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <nav className="p-2">
          <ul className="space-y-1">
            <li>
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted" onClick={onClose}>
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                href="/map-search"
                className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted"
                onClick={onClose}
              >
                <Search className="h-5 w-5" />
                <span>Map Search</span>
              </Link>
            </li>
            <li>
              <Link
                href="/listings"
                className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted"
                onClick={onClose}
              >
                <Home className="h-5 w-5" />
                <span>Listings</span>
              </Link>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <Link
                    href="/saved"
                    className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted"
                    onClick={onClose}
                  >
                    <Heart className="h-5 w-5" />
                    <span>Saved Homes</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted"
                    onClick={onClose}
                  >
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted"
                    onClick={onClose}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {isAdmin && (
          <div className="p-2 border-t mt-2">
            <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground">Admin</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted"
                  onClick={onClose}
                >
                  <Settings className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/properties"
                  className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted"
                  onClick={onClose}
                >
                  <Home className="h-5 w-5" />
                  <span>Properties</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/email-marketing"
                  className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted"
                  onClick={onClose}
                >
                  <Mail className="h-5 w-5" />
                  <span>Email Marketing</span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  )
}

