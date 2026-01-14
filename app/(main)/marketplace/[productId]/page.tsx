"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, serverTimestamp, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { MapPin, Star, ShoppingCart, MessageCircle, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";

type Product = {
  id: string;
  title: string;
  price: number;
  location: string;
  sellerId: string;
  sellerName: string;
  imageUrls: string[];
  category: string; // category ID
  categoryName: string; // category name
  unit: string; // unit ID
  unitName: string; // unit name
  age: number;
  weight: number;
  description: string;
  rating?: number;
  reviews?: number;
  stock: number;
};

type CategoryData = {
  id: string;
  name: string;
};

type UnitData = {
  id: string;
  name: string;
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, userData } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());
  const [unitMap, setUnitMap] = useState<Map<string, string>>(new Map());
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Categories
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const catMap = new Map<string, string>();
        categoriesSnapshot.docs.forEach(doc => catMap.set(doc.id, doc.data().name));
        setCategoryMap(catMap);

        // Fetch Units
        const unitsSnapshot = await getDocs(collection(db, "units"));
        const uMap = new Map<string, string>();
        unitsSnapshot.docs.forEach(doc => uMap.set(doc.id, doc.data().name));
        setUnitMap(uMap);

      } catch (error) {
        console.error("Error fetching initial data: ", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!productId || categoryMap.size === 0 || unitMap.size === 0) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "products", productId as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Fetched product imageUrls:", data.imageUrls); // Add this line
          setProduct({
            id: docSnap.id,
            title: data.name, // Assuming 'name' from Firestore is 'title' for display
            price: data.price,
            location: data.location,
            sellerId: data.sellerId,
            sellerName: data.sellerName,
            imageUrls: data.imageUrls,
            category: data.category,
            categoryName: categoryMap.get(data.category) || "Unknown",
            unit: data.unit,
            unitName: unitMap.get(data.unit) || "Unknown",
            age: data.age,
            weight: data.weight,
            description: data.description,
            rating: data.rating || 0,
            reviews: data.reviews || 0,
            stock: data.stock,
          } as Product);
        } else {
          toast({
            title: "Product Not Found",
            description: "The product you are looking for does not exist.",
            variant: "destructive",
          });
          router.push("/marketplace");
        }
      } catch (error) {
        console.error("Error fetching product: ", error);
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router, toast, categoryMap, unitMap]);

  const handleReviewSubmit = async () => {
    if (!user || !product) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review.",
        variant: "destructive",
      });
      router.push("/signin");
      return;
    }

    if (reviewRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a star rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId: product.id,
        userId: user.uid,
        userName: userData?.firstName + " " + userData?.lastName || "Anonymous",
        rating: reviewRating,
        comment: reviewText,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });
      setIsReviewDialogOpen(false);
      setReviewText("");
      setReviewRating(0);
      // Optionally, re-fetch product to update average rating/reviews
    } catch (error) {
      console.error("Error submitting review: ", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user || !product) {
        toast({
            title: "Authentication Required",
            description: "Please log in to add items to your cart.",
            variant: "destructive",
        });
        router.push("/signin");
        return;
    }

    if (product.stock <= 0) {
        toast({
            title: "Out of Stock",
            description: "This product is currently out of stock.",
            variant: "destructive",
        });
        return;
    }

    try {
        const cartItemRef = doc(db, `users/${user.uid}/cart`, product.id);
        const cartItemSnap = await getDoc(cartItemRef);

        let newQuantity = 1;
        if (cartItemSnap.exists()) {
            const existingItem = cartItemSnap.data();
            newQuantity = existingItem.quantity + 1;
            if (newQuantity > product.stock) {
                toast({
                    title: "Not Enough Stock",
                    description: `You can only add ${product.stock} of this item to your cart.`,
                    variant: "destructive",
                });
                return;
            }
            await updateDoc(cartItemRef, {
                quantity: newQuantity,
                addedAt: serverTimestamp(),
            });
        } else {
            await setDoc(cartItemRef, {
                productId: product.id,
                productName: product.title,
                productImage: product.imageUrls[0] || '',
                price: product.price,
                quantity: newQuantity,
                sellerId: product.sellerId,
                sellerName: product.sellerName,
                addedAt: serverTimestamp(),
            });
        }

        toast({
            title: "Added to Cart",
            description: `${product.title} (${newQuantity}x) added to your cart.`,
        });
    } catch (error) {
        console.error("Error adding to cart: ", error);
        toast({
            title: "Error",
            description: "Failed to add item to cart. Please try again.",
            variant: "destructive",
        });
    }
};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/marketplace">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images Layout */}
          <div className="space-y-4">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <>
                {/* Main Cover Image */}
                <div className="aspect-video relative w-full h-96 rounded-lg overflow-hidden">
                  <Image
                    src={product.imageUrls[0]}
                    alt={`${product.title} cover image`}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Thumbnail Images */}
                {product.imageUrls.length > 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    {product.imageUrls[1] && (
                      <div className="aspect-video relative w-full h-32 rounded-lg overflow-hidden">
                        <Image
                          src={product.imageUrls[1]}
                          alt={`${product.title} image 2`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    {product.imageUrls[2] && (
                      <div className="aspect-video relative w-full h-32 rounded-lg overflow-hidden">
                        <Image
                          src={product.imageUrls[2]}
                          alt={`${product.title} image 3`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-video relative w-full h-96 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <Image
                  src="/placeholder.svg"
                  alt="Placeholder"
                  width={200}
                  height={200}
                  className="object-contain opacity-50"
                />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-foreground">{product.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Badge variant="outline">{product.categoryName}</Badge>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{product.location}</span>
              </div>
              {product.rating !== undefined && product.reviews !== undefined && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{product.rating.toFixed(1)} ({product.reviews} reviews)</span>
                </div>
              )}
            </div>

            <p className="text-5xl font-bold text-emerald-600">{formatCurrency(product.price)}</p>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm space-y-1">
                  <p><strong>Age:</strong> {product.age} days</p>
                  <p><strong>Weight:</strong> {product.weight} kg</p>
                  <p><strong>Unit:</strong> {product.unitName}</p>
                  <p><strong>Stock:</strong> {product.stock}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Seller Information</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm space-y-1">
                  <p><strong>Seller:</strong> {product.sellerName}</p>
                  <p><strong>Location:</strong> {product.location}</p>
                  {/* Add seller rating/contact info here */}
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="flex-1 gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Seller
              </Button>
            </div>

            {/* Review Section */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">Leave a Review</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Your Review</DialogTitle>
                      <DialogDescription>Share your experience with this product.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="rating">Rating</Label>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-6 w-6 cursor-pointer ${
                                star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                              }`}
                              onClick={() => setReviewRating(star)}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="comment">Comment</Label>
                        <Textarea
                          id="comment"
                          placeholder="Write your review here..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleReviewSubmit} disabled={isSubmittingReview}>
                        {isSubmittingReview && <Spinner className="mr-2 h-4 w-4" />}
                        Submit Review
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {/* Display existing reviews here */}
                <div className="mt-4 text-muted-foreground">
                  No reviews yet. Be the first to review this product!
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}