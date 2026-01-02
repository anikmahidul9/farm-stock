"use client"

import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, CreditCard, Wallet, CheckCircle2 } from "lucide-react"

function CheckoutContent() {
  const [paymentMethod, setPaymentMethod] = useState("card")

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-orange-900">Checkout</h1>
        <p className="text-orange-600/80">Complete your order and choose delivery details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Delivery Address */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-orange-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm text-orange-900">
                    First Name
                  </Label>
                  <Input id="firstName" placeholder="John" className="border-orange-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-orange-900">
                    Last Name
                  </Label>
                  <Input id="lastName" placeholder="Doe" className="border-orange-200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm text-orange-900">
                  Phone Number
                </Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="border-orange-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm text-orange-900">
                  Street Address
                </Label>
                <Input id="address" placeholder="123 Main Street" className="border-orange-200" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm text-orange-900">
                    City
                  </Label>
                  <Input id="city" placeholder="San Francisco" className="border-orange-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm text-orange-900">
                    State
                  </Label>
                  <Input id="state" placeholder="CA" className="border-orange-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip" className="text-sm text-orange-900">
                    ZIP Code
                  </Label>
                  <Input id="zip" placeholder="94103" className="border-orange-200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm text-orange-900">
                  Delivery Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., Leave at the front door, Ring doorbell..."
                  className="border-orange-200 resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-orange-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex flex-col gap-4">
                <div className="flex items-center space-x-3 border border-orange-200 rounded-lg p-4 hover:bg-orange-50/50 transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-900">Credit / Debit Card</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border border-orange-200 rounded-lg p-4 hover:bg-orange-50/50 transition-colors">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-900">My Wallet ($125.00 available)</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border border-orange-200 rounded-lg p-4 hover:bg-orange-50/50 transition-colors">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-900">Cash on Delivery</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "card" && (
                <div className="mt-6 flex flex-col gap-4 pt-6 border-t border-orange-100">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-sm text-orange-900">
                      Card Number
                    </Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="border-orange-200" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-sm text-orange-900">
                        Expiry Date
                      </Label>
                      <Input id="expiry" placeholder="MM/YY" className="border-orange-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-sm text-orange-900">
                        CVV
                      </Label>
                      <Input id="cvv" placeholder="123" type="password" className="border-orange-200" />
                    </div>
                  </div>
                </div>
              )}
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
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-600/70">Items (3)</span>
                  <span className="font-medium text-orange-900">$29.96</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-600/70">Delivery</span>
                  <span className="font-medium text-orange-900">$4.99</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-600/70">Tax (8%)</span>
                  <span className="font-medium text-orange-900">$2.40</span>
                </div>
                <Separator className="my-2 bg-orange-100" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-orange-900">Total</span>
                  <span className="text-2xl font-bold text-orange-700">$37.35</span>
                </div>
              </div>

              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-base font-semibold">
                Place Order
              </Button>

              <p className="text-xs text-center text-orange-600/70 leading-relaxed">
                By placing this order, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
