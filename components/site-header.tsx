"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Settings, LogOut, User, LayoutDashboard } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"

const locations = [
  { name: "Aspen Ridge", href: "/aspen-ridge-real-estate" },
  { name: "Evergreen", href: "/evergreen-real-estate" },
  { name: "Montgomery Place", href: "/montgomery-place-real-estate" },
  { name: "Nutana", href: "/nutana-real-estate" },
  { name: "Riversdale", href: "/riversdale-real-estate" },
  { name: "Silverspring", href: "/silverspring-real-estate" },
  { name: "Stonebridge", href: "/stonebridge-real-estate" },
]

export function SiteHeader() {
  const { user, isAuthenticated, isAdmin, setShowAuthModal, logout } = useAuth()

  // Get first letter of user's name for avatar
  const getInitial = () => {
    if (!user?.fullName) return "U"
    return user.fullName.charAt(0).toUpperCase()
  }
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center justify-center gap-2">
            <Image src="/logo.png" width={30} height={30} alt="Logo" className="h-10 w-10" />
            <h1 className="text-xl font-bold tracking-tight">Real Group</h1>
            <p className="text-sm text-muted-foreground">Realtor®</p>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Home
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary">
              Locations <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {locations.map((location) => (
                <DropdownMenuItem key={location.href} asChild>
                  <Link href={location.href}>{location.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/map-search" className="text-sm font-medium hover:text-primary">
            Map Search
          </Link>
          <Link href="/listings" className="text-sm font-medium hover:text-primary">
            Listings
          </Link>
          <Link href="/our-listings" className="text-sm font-medium hover:text-primary">
            Our Listings
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary">
            Contact
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={isAdmin ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"}>
                      {getInitial()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={isAdmin ? "/admin/settings" : "/profile?tab=settings"}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="bg-black" variant="default" size="sm" onClick={() => setShowAuthModal(true)}>
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

