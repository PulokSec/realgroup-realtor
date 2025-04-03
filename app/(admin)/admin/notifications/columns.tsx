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

export type Notification = {
  id: string
  userId: string
  userEmail: string
  type: "system" | "property" | "message" | "lead"
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const columns: ColumnDef<Notification>[] = [
  {
    accessorKey: "userEmail",
    header: "User",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge
          variant={
            type === "system"
              ? "default"
              : type === "property"
                ? "secondary"
                : type === "message"
                  ? "outline"
                  : "success"
          }
        >
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue("message") as string
      return <div className="max-w-xs truncate">{message}</div>
    },
  },
  {
    accessorKey: "read",
    header: "Status",
    cell: ({ row }) => {
      const read = row.getValue("read") as boolean
      return <Badge variant={read ? "outline" : "default"}>{read ? "Read" : "Unread"}</Badge>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString()
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const notification = row.original

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
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Mark as read</DropdownMenuItem>
            <DropdownMenuItem>Resend</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

