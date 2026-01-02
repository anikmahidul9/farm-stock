"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Save } from "lucide-react"

const stockItems = [
  { id: 1, name: "Organic Tomatoes", current: 45, unit: "kg", lastUpdated: "2 hours ago" },
  { id: 2, name: "Fresh Spinach", current: 20, unit: "kg", lastUpdated: "5 hours ago" },
  { id: 3, name: "Honey (500g)", current: 12, unit: "pcs", lastUpdated: "1 day ago" },
  { id: 4, name: "Free Range Eggs", current: 30, unit: "doz", lastUpdated: "3 hours ago" },
]

export default function StockManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
        <p className="text-muted-foreground">Quickly update your inventory levels and view stock history.</p>
      </div>

      <div className="grid gap-4">
        {stockItems.map((item) => (
          <Card key={item.id} className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6">
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                    <History className="h-3 w-3" />
                    Last updated {item.lastUpdated}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 sm:px-8 border-x sm:border-muted-foreground/10">
                  <span className="text-sm font-medium text-muted-foreground">Current Stock</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{item.current}</span>
                    <span className="text-sm font-medium text-muted-foreground">{item.unit}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex-1 sm:w-32">
                    <Input type="number" placeholder="Add/Remove" className="text-center" />
                  </div>
                  <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Recent Stock History</CardTitle>
          <CardDescription>Track all stock adjustments and automated sales deductions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Organic Tomatoes</p>
                  <p className="text-xs text-muted-foreground">Oct 24, 2025 • 02:30 PM</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Manual Update
                  </Badge>
                  <p className="text-sm font-bold mt-1 text-emerald-600">+10 kg</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
