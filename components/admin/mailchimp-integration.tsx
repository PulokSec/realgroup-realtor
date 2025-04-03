"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function MailchimpIntegration() {
  const [apiKey, setApiKey] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [lists, setLists] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const { toast } = useToast()

  // Check if Mailchimp is already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/mailchimp/status")

        if (response.ok) {
          const data = await response.json()
          setIsConnected(data.connected)
          if (data.connected) {
            setApiKey(data.apiKey || "••••••••••••••••••••••••••••••••")
            fetchMailchimpData()
          }
        }
      } catch (error) {
        console.error("Error checking Mailchimp connection:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  const fetchMailchimpData = async () => {
    try {
      // Fetch lists
      const listsResponse = await fetch("/api/admin/mailchimp/lists")
      if (listsResponse.ok) {
        const listsData = await listsResponse.json()
        setLists(listsData.lists || [])
      }

      // Fetch campaigns
      const campaignsResponse = await fetch("/api/admin/mailchimp/campaigns")
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json()
        setCampaigns(campaignsData.campaigns || [])
      }

      // Fetch stats
      const statsResponse = await fetch("/api/admin/mailchimp/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching Mailchimp data:", error)
    }
  }

  const handleConnect = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Mailchimp API key",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)

    try {
      const response = await fetch("/api/admin/mailchimp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      if (!response.ok) {
        throw new Error("Failed to connect to Mailchimp")
      }

      const data = await response.json()

      setIsConnected(true)
      toast({
        title: "Connected to Mailchimp",
        description: "Your Mailchimp account has been successfully connected",
      })

      // Fetch Mailchimp data
      fetchMailchimpData()
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Mailchimp",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch("/api/admin/mailchimp/disconnect", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to disconnect from Mailchimp")
      }

      setIsConnected(false)
      setApiKey("")
      setLists([])
      setCampaigns([])
      setStats(null)

      toast({
        title: "Disconnected from Mailchimp",
        description: "Your Mailchimp account has been disconnected",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect from Mailchimp",
        variant: "destructive",
      })
    }
  }

  const handleImportList = async (listId: string) => {
    try {
      const response = await fetch("/api/admin/mailchimp/import-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listId }),
      })

      if (!response.ok) {
        throw new Error("Failed to import list")
      }

      const data = await response.json()

      toast({
        title: "List Imported",
        description: `Successfully imported ${data.importedCount} subscribers`,
      })
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import list",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mailchimp Integration</CardTitle>
          <CardDescription>Connect your Mailchimp account to sync your email lists and campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="font-medium">{isConnected ? "Connected" : "Not Connected"}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">Mailchimp API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your Mailchimp API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isConnected}
                />
                {isConnected ? (
                  <Button variant="destructive" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                ) : (
                  <Button onClick={handleConnect} disabled={isTestingConnection}>
                    {isTestingConnection ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                You can find your API key in your Mailchimp account under Account &gt; Extras &gt; API keys
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isConnected && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Mailchimp Lists</CardTitle>
              <CardDescription>View and import your Mailchimp audience lists</CardDescription>
            </CardHeader>
            <CardContent>
              {lists.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No lists found in your Mailchimp account</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>List Name</TableHead>
                        <TableHead>Subscribers</TableHead>
                        <TableHead>Open Rate</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lists.map((list) => (
                        <TableRow key={list.id}>
                          <TableCell className="font-medium">{list.name}</TableCell>
                          <TableCell>{list.stats.member_count}</TableCell>
                          <TableCell>{(list.stats.open_rate * 100).toFixed(1)}%</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleImportList(list.id)}>
                              Import
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mailchimp Campaigns</CardTitle>
              <CardDescription>View your recent Mailchimp campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No campaigns found in your Mailchimp account</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Open Rate</TableHead>
                        <TableHead>Click Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.settings.title}</TableCell>
                          <TableCell>{campaign.status}</TableCell>
                          <TableCell>
                            {campaign.send_time ? new Date(campaign.send_time).toLocaleDateString() : "Not sent"}
                          </TableCell>
                          <TableCell>
                            {campaign.report_summary
                              ? `${(campaign.report_summary.open_rate * 100).toFixed(1)}%`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {campaign.report_summary
                              ? `${(campaign.report_summary.click_rate * 100).toFixed(1)}%`
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Mailchimp Account Stats</CardTitle>
                <CardDescription>Overview of your Mailchimp account performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Subscribers</p>
                    <p className="text-2xl font-bold">{stats.total_subscribers}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Open Rate</p>
                    <p className="text-2xl font-bold">{(stats.avg_open_rate * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Click Rate</p>
                    <p className="text-2xl font-bold">{(stats.avg_click_rate * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

