"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationsTab } from "@/components/profile/notifications-tab"
import { SavedSearchesTab } from "@/components/profile/saved-searches-tab"
import { SavedHomesTab } from "@/components/profile/saved-homes-tab"
import { SettingsTab } from "@/components/profile/settings-tab"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Download, LogOut } from "lucide-react"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("notifications")
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (!user) {
    return null // or redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container py-4 md:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {isMobile ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">My Profile</h1>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="saved-searches">Searches</TabsTrigger>
                <TabsTrigger value="saved-homes">Saved</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </>
          ) : (
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="saved-searches">Saved Searches</TabsTrigger>
                <TabsTrigger value="saved-homes">Saved Homes</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download the App!
                </Button>
              </div>
            </div>
          )}

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="saved-searches">
            <SavedSearchesTab />
          </TabsContent>

          <TabsContent value="saved-homes">
            <SavedHomesTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
      <SiteFooter />
    </div>
  )
}

