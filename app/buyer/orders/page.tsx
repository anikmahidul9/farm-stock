"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Download, MessageCircle, RotateCcw } from "lucide-react"
import Link from "next/link"

const orders = [
  {
    id: "ORD-8921",
    date: "Jan 15, 2025",
    status: "delivered",
    items: [
      { name: "Organic Tomatoes", quantity: 2, image: "/ripe-tomatoes.png" },
      { name: "Golden Honey", quantity: 1, image: "/golden-honey.png" },
    ],
    total: 29.96,
    seller: "Green Valley Farm",
  },
  {
    id: "ORD-8920",
    date: "Jan 12, 2025",
    status: "in-transit",
    items: [
      { name: "Fresh Spinach", quantity: 3, image: "/fresh-spinach.png" },
      { name: "Farm Fresh Eggs", quantity: 2, image: "/assorted-eggs.png" },
    ],
    total: 45.47,
    seller: "Sunny Acres",
  },
  {
    id: "ORD-8915",
    date: "Jan 8, 2025",
    status: "delivered",
    items: [{ name: "Organic Tomatoes", quantity: 5, image: "/ripe-tomatoes.png" }],
    total: 24.95,
    seller: "Green Valley Farm",
  },
]

function OrdersContent() {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      delivered: { label: "Delivered", className: "bg-green-100 text-green-700 border-green-200" },
      "in-transit": { label: "In Transit", className: "bg-orange-100 text-orange-700 border-orange-200" },
      processing: { label: "Processing", className: "bg-blue-100 text-blue-700 border-blue-200" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
    }
    return variants[status] || variants.processing
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-orange-900">My Orders</h1>
        <p className="text-orange-600/80">Track and manage your purchases.</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-orange-50 border border-orange-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            All Orders
          </TabsTrigger>
          <TabsTrigger value="in-transit" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            In Transit
          </TabsTrigger>
          <TabsTrigger value="delivered" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            Delivered
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 flex flex-col gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-orange-100 overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-orange-950">Order {order.id}</h3>
                        <Badge className={`${getStatusBadge(order.status).className} border`}>
                          {getStatusBadge(order.status).label}
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-600/70 mt-1">
                        Placed on {order.date} • {order.seller}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-orange-700">${order.total.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-orange-50 rounded-md p-2 pr-3 shrink-0 border border-orange-100"
                      >
                        <div className="h-10 w-10 rounded bg-white overflow-hidden">
                          <img src={item.image || "/placeholder.svg"} alt={item.name} className="object-cover" />
                        </div>
                        <div className="text-xs">
                          <p className="font-medium text-orange-950">{item.name}</p>
                          <p className="text-orange-600/70">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-orange-100">
                    <Link href={`/buyer/orders/${order.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent gap-2"
                      >
                        <Package className="h-4 w-4" />
                        Track Order
                      </Button>
                    </Link>
                    {order.status === "delivered" && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Link href={`/buyer/reviews/new?order=${order.id}`}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </Link>
                      </>
                    )}
                    {order.status === "delivered" && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="in-transit" className="mt-6 flex flex-col gap-4">
          {orders
            .filter((o) => o.status === "in-transit")
            .map((order) => (
              <Card key={order.id} className="border-orange-100">
                <CardContent className="p-6">
                  <p className="text-sm text-orange-600">Showing in-transit orders...</p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="delivered" className="mt-6">
          <p className="text-sm text-orange-600">Filter for delivered orders</p>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <p className="text-sm text-orange-600">Filter for cancelled orders</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  )
}
