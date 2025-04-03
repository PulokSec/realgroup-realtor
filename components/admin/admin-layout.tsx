import type { ReactNode } from "react"
import { AdminSidebar } from "./admin-sidebar"

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}

