"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react"

const wishlistItems = [
  {
    id: 1,
    name: "Organic Tomatoes",
    seller: "Green Valley Farm",
    price: 4.99,
    unit: "per kg",
    rating: 4.8,
    image: "/ripe-tomatoes.png",
    inStock: true,
  },
  {
    id: 2,
    name: "Fresh Spinach",
    seller: "Sunny Acres",
    price: 3.49,
    unit: "per bunch",
    rating: 4.6,
    image: "/fresh-spinach.png",
    inStock: true,
  },
  {
    id: 3,
    name: "Golden Honey",
    seller: "Bee Happy Farms",
    price: 12.99,
    unit: "per 500g",
    rating: 4.9,
    image: "/golden-honey.png",
    inStock: false,
  },
]

function WishlistContent() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-orange-900">My Wishlist</h1>
        <p className="text-orange-600/80">Save your favorite products for later.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="border-orange-100 hover:shadow-md transition-shadow overflow-hidden group">
            <div className="relative aspect-square bg-orange-50 overflow-hidden">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {!item.inStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-orange-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
            <CardContent className="p-4 flex flex-col gap-3">
              <div>
                <h3 className="font-semibold text-orange-950">{item.name}</h3>
                <p className="text-xs text-orange-600/70">{item.seller}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                  <span className="text-sm font-medium text-orange-900">{item.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-orange-50">
                <div>
                  <span className="text-xl font-bold text-orange-700">${item.price}</span>
                  <span className="text-xs text-orange-600/70 ml-1">{item.unit}</span>
                </div>
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                  disabled={!item.inStock}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {wishlistItems.length === 0 && (
        <Card className="border-orange-100">
          <CardContent className="p-12 flex flex-col items-center gap-4">
            <Heart className="h-16 w-16 text-orange-200" />
            <div className="text-center">
              <h3 className="font-semibold text-orange-900 mb-2">Your wishlist is empty</h3>
              <p className="text-sm text-orange-600/70">Start adding products you love!</p>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">Browse Products</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<div>Loading wishlist...</div>}>
      <WishlistContent />
    </Suspense>
  )
}
