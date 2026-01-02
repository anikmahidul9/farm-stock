"use client"

import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, Tag, ArrowRight } from "lucide-react"
import Link from "next/link"

const cartItems = [
  {
    id: 1,
    name: "Organic Tomatoes",
    seller: "Green Valley Farm",
    price: 4.99,
    quantity: 2,
    unit: "kg",
    image: "/ripe-tomatoes.png",
  },
  {
    id: 2,
    name: "Golden Honey",
    seller: "Bee Happy Farms",
    price: 12.99,
    quantity: 1,
    unit: "500g jar",
    image: "/golden-honey.png",
  },
  {
    id: 3,
    name: "Farm Fresh Eggs",
    seller: "Happy Hens Co.",
    price: 6.99,
    quantity: 1,
    unit: "dozen",
    image: "/assorted-eggs.png",
  },
]

function CartContent() {
  const [quantities, setQuantities] = useState(
    cartItems.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {}),
  )

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * quantities[item.id], 0)
  const delivery = 4.99
  const total = subtotal + delivery

  const updateQuantity = (id: number, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] + change),
    }))
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-orange-900">Shopping Cart</h1>
        <p className="text-orange-600/80">Review your items and proceed to checkout.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="border-orange-100 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-24 shrink-0 rounded-md bg-orange-50 overflow-hidden">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-orange-950">{item.name}</h3>
                        <p className="text-xs text-orange-600/70">{item.seller}</p>
                        <p className="text-xs text-orange-600/60 mt-1">
                          ${item.price} per {item.unit}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-orange-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 border border-orange-200 rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-orange-50"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{quantities[item.id]}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-orange-50"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-lg font-bold text-orange-700">
                        ${(item.price * quantities[item.id]).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-orange-100 bg-orange-50/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Tag className="h-5 w-5 text-orange-600" />
              <Input placeholder="Enter promo code" className="flex-1 border-orange-200 bg-white" />
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 bg-transparent">
                Apply
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="border-orange-100 sticky top-24">
            <CardHeader>
              <CardTitle className="text-orange-900">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-600/70">Subtotal</span>
                  <span className="font-medium text-orange-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-600/70">Delivery Fee</span>
                  <span className="font-medium text-orange-900">${delivery.toFixed(2)}</span>
                </div>
                <Separator className="my-2 bg-orange-100" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-orange-900">Total</span>
                  <span className="text-2xl font-bold text-orange-700">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/buyer/checkout" className="w-full">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2 h-12">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/buyer/browse">
                <Button
                  variant="outline"
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                >
                  Continue Shopping
                </Button>
              </Link>

              <div className="bg-orange-50 p-3 rounded-md border border-orange-100 mt-2">
                <p className="text-xs text-orange-700">
                  <strong>Free delivery</strong> on orders over $50. You're ${(50 - subtotal).toFixed(2)} away!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  return (
    <Suspense fallback={<div>Loading cart...</div>}>
      <CartContent />
    </Suspense>
  )
}
