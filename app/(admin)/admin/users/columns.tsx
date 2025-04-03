"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export type User = {
  _id: string
  email: string
  fullName: string
  phoneNumber: string
  role: string
  isAdmin: boolean
  emailVerified: boolean
  createdAt: string
  lastLogin: string
  notificationPreferences: {
    webNotifications: boolean
    emailNotifications: boolean
    browsingHistory: boolean
  }
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge variant={role === "admin" ? "destructive" : "secondary"}>
          {role.toUpperCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "isAdmin",
    header: "Admin Access",
    cell: ({ row }) => {
      const isAdmin = row.getValue("isAdmin") as boolean
      return (
        <Badge variant={isAdmin ? "destructive" : "outline"}>
          {isAdmin ? "ADMIN" : "USER"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "emailVerified",
    header: "Verified",
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified") as boolean
      return (
        <Badge variant={verified ? "success" : "destructive"}>
          {verified ? "VERIFIED" : "PENDING"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const date = row.getValue("lastLogin")
      return (
        <div className="whitespace-nowrap">
          {date && typeof date === 'string' ? new Date(date).toLocaleDateString() : "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "notificationPreferences.webNotifications",
    header: "Web Notifs",
    cell: ({ row }) => {
      const prefs = row.original.notificationPreferences;
      return (
        <Badge variant={prefs?.webNotifications ? "success" : "destructive"}>
          {prefs?.webNotifications ? "ON" : "OFF"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "notificationPreferences.emailNotifications",
    header: "Email Notifs",
    cell: ({ row }) => {
      const prefs = row.original.notificationPreferences;
      return (
        <Badge variant={prefs?.emailNotifications ? "success" : "destructive"}>
          {prefs?.emailNotifications ? "ON" : "OFF"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "notificationPreferences.browsingHistory",
    header: "History Tracking",
    cell: ({ row }) => {
      const prefs = row.original.notificationPreferences;
      return (
        <Badge variant={prefs?.browsingHistory ? "success" : "destructive"}>
          {prefs?.browsingHistory ? "ACTIVE" : "INACTIVE"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user._id)}>
              Copy User ID
            </DropdownMenuItem>
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Login Activity</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]