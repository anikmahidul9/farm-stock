"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, ArrowDownCircle, ArrowUpCircle, CreditCard, History, DollarSign } from "lucide-react"

const paymentHistory = [
  { id: "TXN-901", date: "Oct 24, 2025", type: "Order Sale", amount: 42.75, status: "Completed" },
  { id: "TXN-900", date: "Oct 23, 2025", type: "Withdrawal", amount: -250.0, status: "Pending" },
  { id: "TXN-899", date: "Oct 22, 2025", type: "Order Sale", amount: 15.2, status: "Completed" },
  { id: "TXN-898", date: "Oct 20, 2025", type: "Withdrawal", amount: -100.0, status: "Completed" },
]

export default function SellerEarnings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings & Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings, track commissions, and request payouts.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <ArrowUpCircle className="mr-2 h-4 w-4" /> Request Withdrawal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium opacity-80">Available for Withdrawal</CardTitle>
            <Wallet className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$850.50</div>
            <p className="text-xs mt-1 opacity-70">Payouts are processed within 24-48 hours</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Lifetime Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$3,420.00</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-600 font-medium">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Platform Commission (Avg. 5%)</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$171.00</div>
            <p className="text-xs text-muted-foreground mt-1">Total fees paid to platform</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-600" />
              Transaction History
            </CardTitle>
            <CardDescription>A detailed log of your sales and payout activities.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((txn) => (
                  <TableRow key={txn.id} className="hover:bg-muted/10">
                    <TableCell className="text-xs">{txn.date}</TableCell>
                    <TableCell className="font-medium text-sm">{txn.type}</TableCell>
                    <TableCell className={`font-bold ${txn.amount > 0 ? "text-emerald-600" : "text-destructive"}`}>
                      {txn.amount > 0 ? "+" : ""}${Math.abs(txn.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          txn.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }
                      >
                        {txn.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-blue-600" />
              Payout Settings
            </CardTitle>
            <CardDescription>Manage where you receive your earnings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Primary Method</span>
                <Badge className="bg-emerald-600 text-white border-none">Active</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-emerald-900">Mobile Money / Bank Transfer</p>
                  <p className="text-sm text-emerald-700/70">Account: **** 4321</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Minimum Withdrawal</span>
                <span className="font-medium">$10.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-medium text-emerald-600">Free</span>
              </div>
              <Button variant="outline" className="w-full bg-transparent border-dashed">
                Change Payout Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
