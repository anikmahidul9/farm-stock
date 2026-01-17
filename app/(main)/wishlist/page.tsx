
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Trash2, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

type Product = {
  id: string
  name: string
  price: number
  location: string
  sellerName: string
  imageUrls: string[]
  age: number
  isVerified?: boolean
  inStock?: boolean
  unitName?: string
}

export default function WishlistPage() {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [unitMap, setUnitMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const unitsSnapshot = await getDocs(collection(db, "units"));
        const uMap = new Map<string, string>();
        unitsSnapshot.docs.forEach(doc => uMap.set(doc.id, doc.data().name));
        setUnitMap(uMap);
      } catch (error) {
        console.error("Error fetching units: ", error);
      }
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    if (!user || unitMap.size === 0) {
      setLoading(false)
      return
    }

    const fetchWishlistItems = async () => {
      setLoading(true)
      try {
        const wishlistRef = collection(db, "users", user.uid, "wishlist")
        const wishlistSnapshot = await getDocs(wishlistRef)
        const productPromises = wishlistSnapshot.docs.map(async (wishlistDoc) => {
          const productId = wishlistDoc.id
          const productDocRef = doc(db, "products", productId)
          const productDoc = await getDoc(productDocRef)
          if (productDoc.exists()) {
            const productData = productDoc.data()
            return {
              id: productDoc.id,
              name: productData.name,
              price: productData.price,
              location: productData.location,
              sellerName: productData.sellerName,
              imageUrls: productData.imageUrls || [],
              age: productData.age,
              isVerified: productData.isVerified,
              inStock: productData.stock > 0, // Assuming stock is a number
              unitName: unitMap.get(productData.unit) || "N/A",
            } as Product
          }
          return null
        })

        const products = (await Promise.all(productPromises)).filter(
          (p): p is Product => p !== null
        )
        setWishlistItems(products)
      } catch (error) {
        console.error("Error fetching wishlist items:", error)
        toast.error("Failed to fetch wishlist.")
      } finally {
        setLoading(false)
      }
    }

    fetchWishlistItems()
  }, [user, unitMap])

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return

    const wishlistItemRef = doc(db, "users", user.uid, "wishlist", productId)
    try {
      await deleteDoc(wishlistItemRef)
      setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId))
      toast.success("Removed from wishlist.")
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast.error("Failed to remove from wishlist.")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-sm">
              <div className="relative h-48 w-full bg-gray-200 animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded w-full animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

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
                      src={item.imageUrls[0] || "/placeholder.svg"}
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
                    onClick={() => handleRemoveFromWishlist(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-pretty line-clamp-2 mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {item.sellerName}
                        {item.isVerified && (
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
                    <p className="text-xl font-bold text-emerald-600">
                      Tk{item.price.toLocaleString()} / {item.unitName}
                    </p>
                    <p className="text-sm text-muted-foreground">Age: {item.age} days</p>
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
