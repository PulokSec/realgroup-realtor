"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Home, Building, Users, MessageSquare, Bell, Mail, Settings, Menu, X, UserPlus, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Properties", href: "/admin/properties", icon: Building },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Leads", href: "/admin/leads", icon: UserPlus },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Email Marketing", href: "/admin/email-marketing", icon: Mail },
    { name: "Blog", href: "/admin/blog", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "View Website", href: "/", icon: Home },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden fixed top-4 right-4 z-50" onClick={toggleSidebar}>
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Real Group Admin</h2>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "text-gray-700 hover:bg-gray-100",
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}

