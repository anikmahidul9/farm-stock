
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CartPage() {
  const cartItems = [
    {
      id: 1,
      name: "Premium Holstein Dairy Cow",
      seller: "Green Valley Farm",
      price: 2500,
      quantity: 1,
      image: "/black-and-white-holstein-dairy-cow.jpg",
      age: "3 years",
      verified: true,
    },
    {
      id: 2,
      name: "Healthy Broiler Chickens",
      seller: "Sunrise Poultry",
      price: 150,
      quantity: 10,
      image: "/healthy-white-broiler-chickens.jpg",
      age: "6 weeks",
      verified: true,
    },
    {
      id: 3,
      name: "Boer Goat - Breeding Quality",
      seller: "Mountain Ridge Ranch",
      price: 450,
      quantity: 2,
      image: "/brown-and-white-boer-goat.jpg",
      age: "2 years",
      verified: false,
    },
  ]

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = 50
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-balance">Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some livestock to get started</p>
            <Button asChild>
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              {item.seller}
                              {item.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">Age: {item.age}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xl font-bold text-emerald-600">
                            ${(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">${shipping}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (10%)</span>
                      <span className="font-medium">${tax.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-emerald-600">${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex gap-2">
                      <Input placeholder="Enter promo code" />
                      <Button variant="outline" size="icon">
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>

                  <Button variant="outline" className="w-full mt-2 bg-transparent" asChild>
                    <Link href="/marketplace">Continue Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
