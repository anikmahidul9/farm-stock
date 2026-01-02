"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Package, CheckCircle2, Truck, Home } from "lucide-react"
import Link from "next/link"

function OrderDetailContent({ params }: { params: { id: string } }) {
  const trackingSteps = [
    { label: "Order Placed", time: "Jan 12, 10:30 AM", completed: true, icon: CheckCircle2 },
    { label: "Processing", time: "Jan 12, 11:45 AM", completed: true, icon: Package },
    { label: "Out for Delivery", time: "Jan 13, 9:00 AM", completed: true, icon: Truck },
    { label: "Delivered", time: "Expected: Jan 13, 5:00 PM", completed: false, icon: Home },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-orange-900">Order Details</h1>
          <Badge className="bg-orange-100 text-orange-700 border border-orange-200">In Transit</Badge>
        </div>
        <p className="text-orange-600/80">Order #{params.id}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Tracking Timeline */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-orange-900">Tracking Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative flex flex-col gap-6 pl-8">
                {trackingSteps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-8 flex h-10 w-10 items-center justify-center rounded-full ${
                        step.completed ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-400"
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    {idx < trackingSteps.length - 1 && (
                      <div
                        className={`absolute -left-5 top-10 h-[calc(100%+1.5rem)] w-0.5 ${
                          step.completed ? "bg-orange-600" : "bg-orange-200"
                        }`}
                      />
                    )}
                    <div>
                      <p className={`font-semibold ${step.completed ? "text-orange-950" : "text-orange-600/50"}`}>
                        {step.label}
                      </p>
                      <p className="text-sm text-orange-600/70">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-orange-900">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {[
                { name: "Fresh Spinach", qty: 3, price: 10.47, image: "/fresh-spinach.png" },
                { name: "Farm Fresh Eggs", qty: 2, price: 13.98, image: "/assorted-eggs.png" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-md bg-orange-50 overflow-hidden">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-orange-950">{item.name}</p>
                    <p className="text-sm text-orange-600/70">Quantity: {item.qty}</p>
                  </div>
                  <span className="font-semibold text-orange-700">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Delivery Address */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-orange-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <p className="font-medium text-orange-950">Sarah Johnson</p>
                <p className="text-sm text-orange-600/70 mt-1">
                  123 Main Street
                  <br />
                  San Francisco, CA 94103
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-orange-600/70">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-orange-900">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600/70">Subtotal</span>
                <span className="font-medium text-orange-900">$24.45</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600/70">Delivery</span>
                <span className="font-medium text-orange-900">$4.99</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600/70">Tax</span>
                <span className="font-medium text-orange-900">$1.96</span>
              </div>
              <Separator className="my-1 bg-orange-100" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-orange-900">Total Paid</span>
                <span className="text-xl font-bold text-orange-700">$31.40</span>
              </div>
            </CardContent>
          </Card>

          <Link href="/buyer/orders">
            <Button
              variant="outline"
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
            >
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading order details...</div>}>
      <OrderDetailContent params={params} />
    </Suspense>
  )
}
