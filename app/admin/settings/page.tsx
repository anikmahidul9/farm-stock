"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Percent, BellRing, ShieldAlert } from "lucide-react"

export default function PlatformSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global commission rates, fees, and system behaviors</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              <CardTitle>Commission & Fees</CardTitle>
            </div>
            <CardDescription>Global defaults for platform monetization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Standard Platform Commission (%)</Label>
                <Input type="number" defaultValue="5" />
              </div>
              <div className="space-y-2">
                <Label>Transaction Processing Fee (%)</Label>
                <Input type="number" defaultValue="2.5" />
              </div>
            </div>
            <Button>Save Financial Rules</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" />
              <CardTitle>Notifications & Alerts</CardTitle>
            </div>
            <CardDescription>Configure system-wide alert thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Low Stock Notifications</Label>
                <p className="text-sm text-muted-foreground">Alert sellers when inventory is low</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Seller Order Reminders</Label>
                <p className="text-sm text-muted-foreground">Notify sellers of pending orders every 4 hours</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <CardTitle>Maintenance Mode</CardTitle>
            </div>
            <CardDescription>Temporarily disable the storefront for maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm">Enabling this will prevent customers from placing orders.</p>
              <Button variant="destructive">Enable Maintenance</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
