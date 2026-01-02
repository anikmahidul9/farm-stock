"use client"

import { useState } from "react"
import { Search, Eye, Check, X, Truck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Suspense } from "react"

const orders = [
  {
    id: "ORD-2431",
    customer: "John Doe",
    date: "Oct 24, 2025",
    total: 45.0,
    items: 2,
    status: "New",
    delivery: "Pending",
  },
  {
    id: "ORD-2430",
    customer: "Alice Smith",
    date: "Oct 23, 2025",
    total: 32.5,
    items: 1,
    status: "Accepted",
    delivery: "In Transit",
  },
  {
    id: "ORD-2429",
    customer: "Robert Brown",
    date: "Oct 22, 2025",
    total: 89.0,
    items: 4,
    status: "Delivered",
    delivery: "Completed",
  },
  {
    id: "ORD-2428",
    customer: "Sarah Wilson",
    date: "Oct 22, 2025",
    total: 15.75,
    items: 1,
    status: "Cancelled",
    delivery: "N/A",
  },
]

function OrdersContent() {
  const [filter, setFilter] = useState("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Accepted":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "Delivered":
        return "bg-muted text-muted-foreground border-transparent"
      case "Cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">Monitor and fulfill your customer orders.</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs defaultValue="all" className="w-full lg:w-auto" onValueChange={setFilter}>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search order ID or customer..." className="pl-9 bg-muted/30 border-none" />
        </div>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{order.id}</span>
                    <Badge variant="outline" className={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {order.date}
                    </span>
                    <span>Customer: {order.customer}</span>
                    <span>{order.items} items</span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1 sm:px-8 sm:border-x border-muted-foreground/10">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-emerald-600">${order.total.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" asChild title="View Details">
                    <Link href={`/seller/orders/${order.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  {order.status === "New" && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-emerald-600 border-emerald-200 bg-transparent"
                        title="Accept"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive border-destructive/20 bg-transparent"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {order.status === "Accepted" && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-blue-600 border-blue-200 bg-transparent"
                      title="Mark Shipped"
                    >
                      <Truck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function SellerOrders() {
  return (
    <Suspense fallback={null}>
      <OrdersContent />
    </Suspense>
  )
}
