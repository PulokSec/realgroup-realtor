"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Mail, History } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface NotificationPreferences {
  webNotifications: boolean
  emailNotifications: boolean
  browsingHistory: boolean
}

export function NotificationsTab() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    webNotifications: true,
    emailNotifications: false,
    browsingHistory: true,
  })
  const { toast } = useToast()

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [key]: value,
        }),
      })

      if (!response.ok) throw new Error("Failed to update preferences")

      setPreferences((prev) => ({ ...prev, [key]: value }))
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Email notifications alert
  const emailAlert = !preferences.emailNotifications && (
    <Alert className="mb-6">
      <AlertTitle>You're unsubscribed from all emails</AlertTitle>
      <AlertDescription>To re-subscribe, check the box next to Emails below.</AlertDescription>
    </Alert>
  )

  // Web notifications alert
  const webAlert = !preferences.webNotifications && (
    <Alert className="mb-6">
      <AlertTitle>Looks like you still have web notifications turned off</AlertTitle>
      <AlertDescription>Check your browser's notification settings.</AlertDescription>
    </Alert>
  )

  return (
    <div className="space-y-6">
      {emailAlert}
      {webAlert}

      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Web Notifications</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="web-notifications">Browsing History</Label>
                <p className="text-sm text-muted-foreground">Property updates based on your browsing history</p>
              </div>
            </div>
            <Switch
              id="web-notifications"
              checked={preferences.webNotifications}
              onCheckedChange={(checked) => updatePreference("webNotifications", checked)}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold">Emails</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates and alerts via email</p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => updatePreference("emailNotifications", checked)}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold">Browsing History</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <History className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="browsing-history">Browsing History Updates</Label>
                <p className="text-sm text-muted-foreground">Property updates based on your browsing history</p>
              </div>
            </div>
            <Switch
              id="browsing-history"
              checked={preferences.browsingHistory}
              onCheckedChange={(checked) => updatePreference("browsingHistory", checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

