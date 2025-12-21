
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Trash2, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function WishlistPage() {
  const wishlistItems = [
    {
      id: 1,
      name: "Premium Holstein Dairy Cow",
      seller: "Green Valley Farm",
      price: 2500,
      location: "Texas, USA",
      image: "/black-and-white-holstein-dairy-cow.jpg",
      age: "3 years",
      verified: true,
      inStock: true,
    },
    {
      id: 2,
      name: "Merino Sheep - Premium Wool",
      seller: "Highland Ranch",
      price: 350,
      location: "Montana, USA",
      image: "/white-merino-sheep-with-wool.jpg",
      age: "2 years",
      verified: true,
      inStock: true,
    },
    {
      id: 3,
      name: "Jersey Dairy Cow",
      seller: "Meadow Farm",
      price: 2200,
      location: "California, USA",
      image: "/brown-jersey-dairy-cow.jpg",
      age: "4 years",
      verified: false,
      inStock: false,
    },
    {
      id: 4,
      name: "White Farm Ducks",
      seller: "Lakeside Poultry",
      price: 45,
      location: "Oregon, USA",
      image: "/white-ducks-on-farm.jpg",
      age: "4 months",
      verified: true,
      inStock: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-emerald-600 fill-emerald-600" />
            <h1 className="text-3xl font-bold text-balance">My Wishlist</h1>
          </div>
          <p className="text-muted-foreground">{wishlistItems.length} items saved</p>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save items you love for later</p>
            <Button asChild>
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary" className="bg-white">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white hover:bg-white hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-pretty line-clamp-2 mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {item.seller}
                        {item.verified && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            Verified
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3" />
                    <span>{item.location}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xl font-bold text-emerald-600">${item.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Age: {item.age}</p>
                  </div>

                  <Button className="w-full" disabled={!item.inStock}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
