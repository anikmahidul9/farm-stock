"use client"

import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const reviews = [
  {
    id: 1,
    product: "Organic Tomatoes",
    seller: "Green Valley Farm",
    rating: 5,
    comment: "Absolutely fresh and delicious! Best tomatoes I've had in years.",
    date: "Jan 10, 2025",
    image: "/ripe-tomatoes.png",
  },
  {
    id: 2,
    product: "Golden Honey",
    seller: "Bee Happy Farms",
    rating: 5,
    comment: "Pure and natural taste. Worth every penny!",
    date: "Jan 5, 2025",
    image: "/golden-honey.png",
  },
]

function ReviewsContent() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-orange-900">My Reviews</h1>
        <p className="text-orange-600/80">View and manage your product reviews.</p>
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-orange-100">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-md bg-orange-50 overflow-hidden shrink-0">
                  <img src={review.image || "/placeholder.svg"} alt={review.product} className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div>
                    <h3 className="font-semibold text-orange-950">{review.product}</h3>
                    <p className="text-sm text-orange-600/70">{review.seller}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? "fill-orange-400 text-orange-400" : "text-orange-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-orange-700">{review.comment}</p>
                  <p className="text-xs text-orange-600/60 mt-1">Reviewed on {review.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div>Loading reviews...</div>}>
      <ReviewsContent />
    </Suspense>
  )
}
