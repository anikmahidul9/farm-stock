"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter } from "lucide-react"
import { Suspense } from "react"

function WalletContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet & Transactions</h1>
          <p className="text-muted-foreground mt-1">Monitor platform fund flows and manage user balances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export History</Button>
          <Button>Manual Adjustment</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">System Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.2M</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Seller Escrow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$450K</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Platform Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$89.4K</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Withdrawals Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">24</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Live feed of all financial movements on the platform</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Transaction ID or User..." className="pl-9" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  id: "TX-9012",
                  user: "Seller: Green Valley",
                  type: "Order Payment",
                  amount: "+$245.00",
                  status: "Completed",
                },
                {
                  id: "TX-9013",
                  user: "Buyer: John Doe",
                  type: "Wallet Topup",
                  amount: "+$100.00",
                  status: "Completed",
                },
                {
                  id: "TX-9014",
                  user: "Seller: Fresh Harvest",
                  type: "Withdrawal",
                  amount: "-$1,200.00",
                  status: "Pending",
                },
              ].map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                  <TableCell className="font-medium">{tx.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.type}</Badge>
                  </TableCell>
                  <TableCell
                    className={
                      tx.amount.startsWith("+") ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
                    }
                  >
                    {tx.amount}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === "Completed" ? "default" : "secondary"}>{tx.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">Today, 2:45 PM</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function WalletManagement() {
  return (
    <Suspense fallback={null}>
      <WalletContent />
    </Suspense>
  )
}
