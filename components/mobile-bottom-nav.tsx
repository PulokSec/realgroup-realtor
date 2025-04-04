"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  MapPin,
  MenuIcon,
  Home,
  Search,
  User,
  Phone,
  Landmark,
  Map,
  Navigation,
  PhoneCall,
  ArrowLeft,
  LayoutDashboard,
  Settings,
  LogOut,
  MapPinHouse,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"

// Define the locations array
const locations = [
  { name: "Aspen Ridge", href: "/aspen-ridge-real-estate" },
  { name: "Evergreen", href: "/evergreen-real-estate" },
  { name: "Montgomery Place", href: "/montgomery-place-real-estate" },
  { name: "Nutana", href: "/nutana-real-estate" },
  { name: "Riversdale", href: "/riversdale-real-estate" },
  { name: "Silverspring", href: "/silverspring-real-estate" },
  { name: "Stonebridge", href: "/stonebridge-real-estate" },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { user, isAuthenticated, isAdmin, setShowAuthModal, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [locationsOpen, setLocationsOpen] = useState(false)
  const router = useRouter()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const handleLocationClick = (href: string) => {
    setLocationsOpen(false)
    setMenuOpen(false)
    router.push(href)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
        <div className="grid grid-cols-5 h-16">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center justify-center text-xs",
              isActive("/") ? "text-primary" : "text-gray-500",
            )}
          >
            <Home className="h-5 w-5 mr-3" />
            <span>Home</span>
          </Link>
          {
            isAdmin ? (
              <Link
                href="/admin"
                className={cn(
                  "flex flex-col items-center justify-center text-xs",
                  isActive("/admin") ? "text-primary" : "text-gray-500",
                )}
              >
                <LayoutDashboard className="h-5 w-5 mb-1" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/map-search"
                className={cn(
                  "flex flex-col items-center justify-center text-xs",
                  isActive("/map-search") ? "text-primary" : "text-gray-500",
                )}
              >
                <Map className="h-5 w-5 mb-1" />
                <span>Map</span>
              </Link>
            )
          }

          {
            isAuthenticated ? (<Link
              href={isAdmin ? "/admin/settings" : "/profile?tab=settings"}
              className={cn(
                "flex flex-col items-center justify-center text-xs",
                (isActive("/admin/settings") || isActive("/profile?tab=settings")) ? "text-primary" : "text-gray-500",
              )}
            >
              <Settings className="h-5 w-5 mb-1" />
              <span>Settings</span>
            </Link>
            ) : (isAuthenticated && !isAdmin) ? (
              <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center justify-center text-xs",
              isActive("/profile") ? "text-primary" : "text-gray-500",
            )}
          >
            <User className="h-5 w-5 mb-1" />
            <span>My Profile</span>
          </Link>
            ):(
              <Link
            href="/contact"
            className={cn(
              "flex flex-col items-center justify-center text-xs",
              isActive("/contact") ? "text-primary" : "text-gray-500",
            )}
          >
            <Phone className="h-5 w-5 mb-1" />
            <span>Contact</span>
          </Link>
            )
          }

          {
            isAuthenticated ? (
              <button
              onClick={logout}
                className="flex flex-col items-center justify-center text-xs text-gray-500"
              >
                <LogOut className="h-5 w-5 mb-1" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex flex-col items-center justify-center text-xs text-gray-500"
              >
                <User className="h-5 w-5 mb-1" />
                <span>Login</span>
              </button>
            )
          }

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center text-xs text-gray-500">
                <MenuIcon className="h-5 w-5 mb-1" />
                <span>Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <SheetHeader className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
                  <Button variant="ghost" size="sm" onClick={() => setMenuOpen(false)}>
                    Close
                  </Button>
                </div>
              </SheetHeader>

              <nav className="p-4 overflow-y-auto h-full">
                <ul className="space-y-4">

                  <li className="border-b pb-4">
                    <button
                      className="flex items-center justify-between w-full text-left"
                      onClick={() => setLocationsOpen(true)}
                    >
                      <div className="flex items-center">
                        <Navigation className="h-5 w-5 mr-3" />
                        <span>Locations</span>
                      </div>
                      <span>›</span>
                    </button>
                  </li>

                  <li className="border-b pb-4">
                    <Link
                      href="/listings"
                      className="flex items-center justify-between"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <Search className="h-5 w-5 mr-3" />
                        <span>Listings</span>
                      </div>
                    </Link>
                  </li>
                  <li className="border-b pb-4">
                    <Link
                      href="/map-search"
                      className="flex items-center justify-between"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <Map className="h-5 w-5 mr-3" />
                        <span>Map Search</span>
                      </div>
                    </Link>
                  </li>

                  <li className="border-b pb-4">
                    <Link href="/our-listings" className="flex items-center justify-between" onClick={() => setMenuOpen(false)}>
                      <div className="flex items-center">
                        <MapPinHouse className="h-5 w-5 mr-3" />
                        <span>Our Listings</span>
                      </div>
                    </Link>
                  </li>

                  <li className="border-b pb-4">
                    <Link href="/blog" className="flex items-center justify-between" onClick={() => setMenuOpen(false)}>
                      <div className="flex items-center">
                        <span className="h-5 w-5 mr-3 flex items-center justify-center font-semibold">B</span>
                        <span>Blog</span>
                      </div>
                    </Link>
                  </li>
                  <li className="border-b pb-4">
                    <Link href="/about" className="flex items-center justify-between" onClick={() => setMenuOpen(false)}>
                      <div className="flex items-center">
                        <span className="h-5 w-5 mr-3 flex items-center justify-center font-semibold">A</span>
                        <span>About</span>
                      </div>
                    </Link>
                  </li>

                  <li className="border-b pb-4">
                    <Link
                      href="/contact"
                      className="flex items-center justify-between"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <PhoneCall className="h-5 w-5 mr-3" />
                        <span>Contact</span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Locations Sheet */}
          <Sheet open={locationsOpen} onOpenChange={setLocationsOpen}>
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <SheetHeader className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <SheetTitle className="text-lg font-semibold">Locations</SheetTitle>
                  <Button variant="ghost" size="sm" onClick={() => setLocationsOpen(false)}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
              </SheetHeader>

              <nav className="p-4 overflow-y-auto h-full">
                <ul className="space-y-4">
                  {locations.map((location) => (
                    <li key={location.href} className="border-b pb-4">
                      <button
                        className="flex items-center justify-between w-full text-left"
                        onClick={() => handleLocationClick(location.href)}
                      >
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 mr-3" />
                          <span>{location.name}</span>
                        </div>
                        <span>›</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Add padding to the bottom of the page to account for the fixed nav */}
      <div className="h-16 md:h-0"></div>
    </>
  )
}

