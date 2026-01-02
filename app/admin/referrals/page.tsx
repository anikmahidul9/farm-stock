"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Gift, TrendingUp, Users, Settings } from "lucide-react"

export default function ReferralManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral System</h1>
          <p className="text-muted-foreground mt-1">Configure rewards and track platform growth through invites</p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Program Settings
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Referral Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards Paid</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground mt-1">In platform credit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4%</div>
            <p className="text-xs text-muted-foreground mt-1">Invite to purchase</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reward Configurations</CardTitle>
          <CardDescription>Define how much users earn for bringing others to the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Referrer Reward (Buyer)</label>
              <div className="flex gap-2">
                <Input defaultValue="10" type="number" />
                <Badge variant="outline" className="shrink-0">
                  $ Credits
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New User Bonus (Buyer)</label>
              <div className="flex gap-2">
                <Input defaultValue="5" type="number" />
                <Badge variant="outline" className="shrink-0">
                  $ Credits
                </Badge>
              </div>
            </div>
          </div>
          <Button>Update Rewards</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Invites</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Earned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Alex Rivera", invites: 45, conversions: 12, earned: "$120" },
                { name: "Jordan Smith", invites: 32, conversions: 8, earned: "$80" },
                { name: "Taylor Green", invites: 28, conversions: 5, earned: "$50" },
              ].map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.invites}</TableCell>
                  <TableCell>{row.conversions}</TableCell>
                  <TableCell>{row.earned}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
