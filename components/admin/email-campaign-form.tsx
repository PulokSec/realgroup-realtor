"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Send, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(() => import("@/components/ui/editor"), { ssr: false })

export function EmailCampaignForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailLists, setEmailLists] = useState<any[]>([])
  const [selectedList, setSelectedList] = useState("")
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined)
  const [showCalendar, setShowCalendar] = useState(false)
  const [editorContent, setEditorContent] = useState("")
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  // Fetch email lists on component mount
  useState(() => {
    const fetchEmailLists = async () => {
      try {
        const response = await fetch("/api/admin/email-lists")
        if (response.ok) {
          const data = await response.json()
          setEmailLists(data)
        }
      } catch (error) {
        console.error("Error fetching email lists:", error)
      }
    }

    fetchEmailLists()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current) return

    setIsSubmitting(true)

    try {
      const formData = new FormData(formRef.current)
      formData.append("content", editorContent)

      if (scheduleDate) {
        formData.append("scheduledFor", scheduleDate.toISOString())
      }

      const response = await fetch("/api/admin/email-campaigns", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to create campaign")
      }

      toast({
        title: "Campaign created",
        description: scheduleDate
          ? `Your campaign has been scheduled for ${format(scheduleDate, "PPP")}`
          : "Your campaign has been created and is ready to send",
      })

      // Reset form
      formRef.current.reset()
      setEditorContent("")
      setScheduleDate(undefined)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="subject">Email Subject</Label>
        <Input id="subject" name="subject" placeholder="Enter email subject" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="list">Select Recipient List</Label>
        <Select value={selectedList} onValueChange={setSelectedList} name="listId">
          <SelectTrigger>
            <SelectValue placeholder="Select an email list" />
          </SelectTrigger>
          <SelectContent>
            {emailLists.length > 0 ? (
              emailLists.map((list) => (
                <SelectItem key={list._id} value={list._id}>
                  {list.name} ({list.subscriberCount} subscribers)
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                No email lists available
              </SelectItem>
            )}
            <SelectItem value="all">All Contacts</SelectItem>
            <SelectItem value="leads">All Leads</SelectItem>
            <SelectItem value="users">All Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Email Content</Label>
        <Editor value={editorContent} onChange={setEditorContent} placeholder="Compose your email content here..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="schedule">Schedule (Optional)</Label>
        <div className="flex gap-2">
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !scheduleDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduleDate ? format(scheduleDate, "PPP") : "Schedule for later"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={scheduleDate}
                onSelect={(date) => {
                  setScheduleDate(date)
                  setShowCalendar(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {scheduleDate && (
            <Button type="button" variant="ghost" size="icon" onClick={() => setScheduleDate(undefined)}>
              <Clock className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedList}>
          {isSubmitting ? "Creating..." : scheduleDate ? "Schedule Campaign" : "Send Campaign"}
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}

