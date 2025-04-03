"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailCampaignForm } from "@/components/admin/email-campaign-form"
import { EmailListUploader } from "@/components/admin/email-list-uploader"
import { EmailTemplates } from "@/components/admin/email-templates"
import { EmailStats } from "@/components/admin/email-stats"
import { MailchimpIntegration } from "@/components/admin/mailchimp-integration"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import AdminLayout from "../layout"

export default function EmailMarketingPage() {
  const [activeTab, setActiveTab] = useState("campaigns")
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <AdminLayout>
        <div className="container mx-auto py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Email Marketing</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 md:mb-6">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="lists">Email Lists</TabsTrigger>
          <TabsTrigger value="mailchimp">Mailchimp</TabsTrigger>
          <TabsTrigger value="stats">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Create Campaign</CardTitle>
              <CardDescription>Create a new email campaign to send to your contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailCampaignForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="lists">
          <Card>
            <CardHeader>
              <CardTitle>Email Lists</CardTitle>
              <CardDescription>Manage your email lists and subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailListUploader />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mailchimp">
          <MailchimpIntegration />
        </TabsContent>

        <TabsContent value="stats">
          <EmailStats />
        </TabsContent>
      </Tabs>
    </div>
    </AdminLayout>
  )
}

