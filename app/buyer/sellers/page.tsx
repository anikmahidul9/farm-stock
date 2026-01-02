"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Package, Heart } from "lucide-react"
import Link from "next/link"

const savedSellers = [
  {
    id: 1,
    name: "Green Valley Farm",
    location: "2.3 km away",
    rating: 4.8,
    reviews: 324,
    products: 45,
    image: "/idyllic-farm.png",
    verified: true,
  },
  {
    id: 2,
    name: "Bee Happy Farms",
    location: "5.2 km away",
    rating: 4.9,
    reviews: 201,
    products: 12,
    image: "/golden-honey.png",
    verified: true,
  },
  {
    id: 3,
    name: "Sunny Acres",
    location: "3.1 km away",
    rating: 4.6,
    reviews: 89,
    products: 32,
    image: "/assorted-vegetables.png",
    verified: false,
  },
]

function SavedSellersContent() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-orange-900">Saved Sellers</h1>
        <p className="text-orange-600/80">Your favorite local farmers and vendors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedSellers.map((seller) => (
          <Card key={seller.id} className="border-orange-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-orange-100 overflow-hidden shrink-0">
                  <img
                    src={seller.image || "/placeholder.svg"}
                    alt={seller.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-orange-950">{seller.name}</h3>
                      {seller.verified && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] mt-1">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                    <span className="text-sm font-medium text-orange-900">{seller.rating}</span>
                    <span className="text-xs text-orange-600/60">({seller.reviews})</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-orange-600/70">
                  <MapPin className="h-4 w-4" />
                  <span>{seller.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-orange-600/70">
                  <Package className="h-4 w-4" />
                  <span>{seller.products} products available</span>
                </div>
              </div>

              <Link href={`/buyer/sellers/${seller.id}`} className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                >
                  View Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function SavedSellersPage() {
  return (
    <Suspense fallback={<div>Loading sellers...</div>}>
      <SavedSellersContent />
    </Suspense>
  )
}
