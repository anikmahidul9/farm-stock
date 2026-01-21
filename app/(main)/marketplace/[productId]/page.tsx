"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, serverTimestamp, getDocs, setDoc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { MapPin, Star, ShoppingCart, MessageCircle, ChevronLeft, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

type Review = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      try {
        const q = query(
          collection(db, "reviews"),
          where("productId", "==", productId),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews: ", error);
      }
    };

    fetchReviews();
  }, [productId]);

  useEffect(() => {
    const checkPurchase = async () => {
      if (!user || !product) return;
      
      setCheckingPurchase(true);
      try {
        console.log("Checking purchase for user:", user.uid, "product:", product.id);
        
        // Query orders where user is buyer and status is delivered
        const ordersQuery = query(
          collection(db, "orders"),
          where("buyerId", "==", user.uid),
          where("status", "in", ["delivered", "paid"]) // Check both delivered and paid orders
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        
        console.log("Found orders:", ordersSnapshot.size);
        
        let found = false;
        
        for (const orderDoc of ordersSnapshot.docs) {
          const orderData = orderDoc.data();
          console.log("Checking order:", orderData.tran_id, "orderType:", orderData.orderType);
          
          if (orderData.orderType === "cart_checkout" && orderData.cartItems) {
            // Check cart items
            console.log("Cart items:", orderData.cartItems);
            const hasItem = orderData.cartItems.some((item: any) => item.productId === product.id);
            if (hasItem) {
              console.log("Found product in cart order!");
              found = true;
              break;
            }
          } else if (orderData.orderType === "single_offer" && orderData.offerInfo) {
            // Check single offers by looking at the buy request
            console.log("Checking single offer with product:", product);
            // For single offers, we need to check if the product belongs to the seller
            // and if it's related to this order. This is more complex.
            // For now, we'll check if the seller matches and it's a delivered order
            if (orderData.sellerId === product.sellerId && orderData.status === "delivered") {
              console.log("Found matching delivered single offer!");
              found = true;
              break;
            }
          } else {
            // Fallback for older orders structure
            if (orderData.items && Array.isArray(orderData.items)) {
              const hasItem = orderData.items.some((item: any) => item.productId === product.id);
              if (hasItem) {
                console.log("Found product in old order structure!");
                found = true;
                break;
              }
            }
          }
        }
        
        console.log("Purchase check result:", found);
        setHasPurchased(found);
        
      } catch (error) {
        console.error("Error checking purchase history: ", error);
      } finally {
        setCheckingPurchase(false);
      }
    };

    if (product && user) {
      checkPurchase();
    } else {
      setCheckingPurchase(false);
    }
  }, [user, product]);

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
          console.log("Fetched product imageUrls:", data.imageUrls);
          setProduct({
            id: docSnap.id,
            title: data.name,
            price: data.price,
            location: data.location,
            sellerId: data.sellerId,
            sellerName: data.sellerName,
            imageUrls: data.imageUrls || [],
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

  // Check if user has already reviewed this product
  const hasUserReviewed = reviews.some(review => {
    // Check if we have user info to compare
    if (!userData) return false;
    const reviewerName = `${userData.firstName} ${userData.lastName}`.trim();
    return review.userName === reviewerName;
  });

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

    if (!hasPurchased) {
      toast({
        title: "Purchase Required",
        description: "You must purchase this product before leaving a review.",
        variant: "destructive",
      });
      return;
    }

    if (hasUserReviewed) {
      toast({
        title: "Already Reviewed",
        description: "You have already submitted a review for this product.",
        variant: "destructive",
      });
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

    if (!reviewText.trim()) {
      toast({
        title: "Review Required",
        description: "Please write a review comment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const userName = userData?.firstName && userData?.lastName 
        ? `${userData.firstName} ${userData.lastName}`
        : userData?.firstName || userData?.email?.split('@')[0] || "Anonymous";

      const newReviewRef = await addDoc(collection(db, "reviews"), {
        productId: product.id,
        userId: user.uid,
        userName: userName,
        rating: reviewRating,
        comment: reviewText.trim(),
        createdAt: serverTimestamp(),
      });

      // Update the product's average rating
      const reviewsQuery = query(collection(db, "reviews"), where("productId", "==", product.id));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const totalReviews = reviewsSnapshot.size;
      const totalRating = reviewsSnapshot.docs.reduce((acc, doc) => acc + doc.data().rating, 0);
      const newAverageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, {
        rating: newAverageRating,
        reviews: totalReviews,
      });

      // Update local state
      setReviews(prev => [...prev, { 
        id: newReviewRef.id, 
        userName: userName, 
        rating: reviewRating, 
        comment: reviewText.trim(), 
        createdAt: new Date() 
      }]);
      setProduct(prev => prev ? { ...prev, rating: newAverageRating, reviews: totalReviews } : null);

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });
      setIsReviewDialogOpen(false);
      setReviewText("");
      setReviewRating(0);
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
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('BDT', 'Tk');
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

            <p className="text-5xl font-bold text-emerald-600">
              {formatCurrency(product.price)} / {product.unitName}
            </p>

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
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              {userData?.role !== 'seller' && (
                <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              )}
              {user?.uid !== product.sellerId && (
                <Button size="lg" variant="outline" className="flex-1 gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contact Seller
                </Button>
              )}
            </div>

            {/* Review Section */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Reviews</CardTitle>
                  {checkingPurchase ? (
                    <span className="text-sm text-muted-foreground">Checking purchase...</span>
                  ) : hasPurchased && !hasUserReviewed && userData?.role === 'buyer' ? (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Eligible to Review
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                {/* Review Submission */}
                {userData?.role === 'buyer' && hasPurchased && !hasUserReviewed && !checkingPurchase && (
                  <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mb-6 gap-2">
                        <Star className="h-4 w-4" />
                        Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit Your Review</DialogTitle>
                        <DialogDescription>Share your experience with {product.title}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="rating">Rating *</Label>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="p-1"
                              >
                                <Star
                                  className={`h-8 w-8 cursor-pointer transition-all ${
                                    star <= reviewRating 
                                      ? "fill-yellow-400 text-yellow-400 scale-110" 
                                      : "text-muted-foreground hover:text-yellow-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {reviewRating === 0 ? "Select a rating" : 
                             reviewRating === 1 ? "Poor" :
                             reviewRating === 2 ? "Fair" :
                             reviewRating === 3 ? "Good" :
                             reviewRating === 4 ? "Very Good" : "Excellent"}
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="comment">Review *</Label>
                          <Textarea
                            id="comment"
                            placeholder="Share your experience with this product..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Minimum 10 characters required
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleReviewSubmit} 
                          disabled={isSubmittingReview || reviewRating === 0 || reviewText.trim().length < 10}
                        >
                          {isSubmittingReview && <Spinner className="mr-2 h-4 w-4" />}
                          Submit Review
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {userData?.role === 'buyer' && !hasPurchased && !checkingPurchase && (
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Purchase this product to leave a review.
                    </p>
                  </div>
                )}

                {hasUserReviewed && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-700">
                      You have already submitted a review for this product.
                    </p>
                  </div>
                )}

                {/* Display existing reviews */}
                <div className="mt-6 space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{review.userName}</p>
                              {userData && review.userName === `${userData.firstName} ${userData.lastName}`?.trim() && (
                                <Badge variant="outline" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating 
                                      ? "text-yellow-400 fill-yellow-400" 
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {review.createdAt?.toDate 
                              ? format(review.createdAt.toDate(), 'MMM dd, yyyy')
                              : new Date(review.createdAt).toLocaleDateString()}
                          </p>
                          <p className="mt-2 text-foreground">{review.comment}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="mt-4 text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}