"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Truck, Package, Phone, Mail, MapPin, Printer, Check } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function OrderDetails({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/seller/orders">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Order {params.id}</h1>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">New</Badge>
            </div>
            <p className="text-muted-foreground">Placed on Oct 24, 2025 • 03:45 PM</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> Print Invoice
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm">
            <Check className="mr-2 h-4 w-4" /> Accept Order
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: "Organic Tomatoes", qty: 5, price: 4.5, unit: "kg" },
                { name: "Fresh Spinach", qty: 2, price: 2.99, unit: "kg" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-muted border overflow-hidden">
                    <img src="/placeholder.svg" alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.qty} {item.unit} x ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right font-bold">${(item.qty * item.price).toFixed(2)}</div>
                </div>
              ))}
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>$28.48</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Commission (5%)</span>
                  <span className="text-destructive">-$1.42</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Your Earnings</span>
                  <span className="text-emerald-600">$27.06</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Marketplace Logistics</p>
                  <p className="text-sm text-muted-foreground">Assigned delivery person: Waiting for acceptance...</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mt-1">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Pickup Ready</p>
                  <p className="text-sm text-muted-foreground">Please pack items securely for delivery.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted border flex items-center justify-center font-bold">
                  JD
                </div>
                <p className="font-bold">John Doe</p>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+1 (555) 000-0000</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>john.doe@example.com</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>123 Fresh Lane, Garden District, Metropolis</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-emerald-50/50">
            <CardHeader>
              <CardTitle className="text-emerald-800">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-700/70 font-medium">Order Status</span>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">New</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-700/70 font-medium">Payment Mode</span>
                <span className="font-bold">Digital Wallet</span>
              </div>
              <div className="pt-4 flex justify-between items-center border-t border-emerald-200">
                <span className="text-emerald-800 font-bold">Grand Total</span>
                <span className="text-emerald-600 font-black text-xl">$45.00</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
