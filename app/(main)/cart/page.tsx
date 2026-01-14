"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, ShoppingBag, Tag, AlertCircle, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"

import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  serverTimestamp, 
  addDoc, 
  writeBatch,
  query,
  getDocs 
} from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

type CartItem = {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  sellerId: string
  sellerName: string
  addedAt: any
  stock?: number;
}

export default function CartPage() {
  const { user, userData } = useAuth()
  const { toast } = useToast()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [processingItems, setProcessingItems] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setCartItems([])
      return
    }

    const cartRef = collection(db, `users/${user.uid}/cart`)
    const unsubscribe = onSnapshot(cartRef, async (snapshot) => {
      const fetchedItems: CartItem[] = []
      for (const docSnap of snapshot.docs) {
        const item = docSnap.data() as CartItem;
        // Fetch product stock to ensure it's up-to-date
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const productData = productSnap.data();
          item.stock = productData.stock || 0;
          // Update price if it has changed
          if (item.price !== productData.price) {
            await updateDoc(docSnap.ref, { price: productData.price });
            item.price = productData.price;
          }
        } else {
          // If product doesn't exist, remove from cart
          await deleteDoc(docSnap.ref);
          continue;
        }
        fetchedItems.push(item);
      }
      setCartItems(fetchedItems)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching cart items:", error)
      toast({
        title: "Error",
        description: "Failed to load cart items.",
        variant: "destructive",
      })
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, toast])

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (!user) return
    const itemToUpdate = cartItems.find(item => item.productId === productId);
    if (!itemToUpdate) return;

    if (newQuantity < 1) {
      await handleRemoveItem(productId);
      return;
    }
    if (itemToUpdate.stock !== undefined && newQuantity > itemToUpdate.stock) {
      toast({
        title: "Not Enough Stock",
        description: `Only ${itemToUpdate.stock} of ${itemToUpdate.productName} are available.`,
        variant: "destructive",
      });
      return;
    }

    setProcessingItems(prev => [...prev, productId]);
    try {
      const cartItemRef = doc(db, `users/${user.uid}/cart`, productId)
      await updateDoc(cartItemRef, { quantity: newQuantity })
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update item quantity.",
        variant: "destructive",
      })
    } finally {
      setProcessingItems(prev => prev.filter(id => id !== productId));
    }
  }

  const handleRemoveItem = async (productId: string) => {
    if (!user) return
    setProcessingItems(prev => [...prev, productId]);
    try {
      const cartItemRef = doc(db, `users/${user.uid}/cart`, productId)
      await deleteDoc(cartItemRef)
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      })
    } catch (error) {
      console.error("Error removing item:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      })
    } finally {
      setProcessingItems(prev => prev.filter(id => id !== productId));
    }
  }

  const clearCart = async () => {
    if (!user) return;
    
    try {
      const batch = writeBatch(db);
      const cartRef = collection(db, `users/${user.uid}/cart`);
      const cartSnapshot = await getDocs(cartRef);
      
      cartSnapshot.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      
      await batch.commit();
      console.log("Cart cleared successfully");
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  };

  const handleProceedToCheckout = async () => {
    if (!user || !userData || cartItems.length === 0) {
      toast({
        title: "Checkout Error",
        description: "Your cart is empty or you are not logged in.",
        variant: "destructive",
      });
      return;
    }

    setPaymentLoading(true);

    try {
      // Validate cart items before checkout
      const validationErrors = [];
      
      for (const item of cartItems) {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);
        
        if (!productSnap.exists()) {
          validationErrors.push(`${item.productName} is no longer available`);
          continue;
        }
        
        const productData = productSnap.data();
        if (item.stock !== undefined && item.quantity > item.stock) {
          validationErrors.push(`Only ${item.stock} of ${item.productName} are available`);
        }
      }
      
      if (validationErrors.length > 0) {
        toast({
          title: "Cart Validation Failed",
          description: (
            <div>
              <p>Please fix the following issues:</p>
              <ul className="list-disc pl-4 mt-2">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive",
        });
        setPaymentLoading(false);
        return;
      }

      const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tran_id = `CART-${Date.now()}`;

      console.log("Creating order with tran_id:", tran_id);

      // Create a main cart order
      const orderRef = await addDoc(collection(db, 'orders'), {
        tran_id,
        buyerId: user.uid,
        sellerIds: [...new Set(cartItems.map(item => item.sellerId))], // Unique seller IDs
        amount: totalAmount,
        currency: 'BDT',
        status: 'pending',
        orderType: 'cart_checkout',
        createdAt: serverTimestamp(),
        buyerInfo: {
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Customer',
          email: userData.email || 'customer@example.com',
          phone: userData.phone || '01700000000',
          address: userData.address || 'Dhaka, Bangladesh',
        },
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          subtotal: item.price * item.quantity,
        })),
        shippingCost: 500,
        taxRate: 0.05,
        taxAmount: totalAmount * 0.05,
        totalAmount: totalAmount + 500 + (totalAmount * 0.05),
        promoCode: promoCode || null,
      });

      console.log("Order created:", orderRef.id);

      // Prepare buyer details for payment
      const buyerDetails = {
        uid: user.uid,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Customer',
        email: userData.email || 'customer@example.com',
        phone: userData.phone || '01700000000',
        address: userData.address || 'Dhaka, Bangladesh',
        city: userData.city || 'Dhaka',
        state: userData.state || 'Dhaka',
        postcode: userData.postcode || '1212',
      };

      console.log("Initiating payment...");
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offer: {
            id: orderRef.id,
            buyRequestTitle: `Cart Checkout (${cartItems.length} items)`,
            price: totalAmount + 500 + (totalAmount * 0.05),
            sellerId: 'multiple',
          },
          buyer: buyerDetails,
          orderId: orderRef.id,
        }),
      });

      console.log("Payment API response status:", response.status);
      const data = await response.json();
      console.log("Payment API response data:", data);

      if (response.ok && data.url) {
        console.log("Payment initiated successfully, clearing cart...");
        
        // Clear cart after successful initiation
        await clearCart();
        
        // Reduce stock for purchased items
        const stockUpdatePromises = cartItems.map(async (item) => {
          try {
            const productRef = doc(db, "products", item.productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              const currentStock = productSnap.data().stock || 0;
              const newStock = Math.max(0, currentStock - item.quantity);
              await updateDoc(productRef, {
                stock: newStock,
                lastUpdated: serverTimestamp()
              });
            }
          } catch (stockError) {
            console.error(`Error updating stock for ${item.productId}:`, stockError);
          }
        });
        
        await Promise.all(stockUpdatePromises);
        
        toast({
          title: "Redirecting to Payment",
          description: "Your cart has been processed. Redirecting to payment gateway...",
        });
        
        console.log("Redirecting to payment URL:", data.url);
        window.location.href = data.url;
      } else {
        console.error("Payment initiation failed:", data);
        throw new Error(data.error || data.failedreason || "Failed to initiate payment.");
      }
    } catch (error: any) {
      console.error("Checkout failed:", error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to proceed to checkout. Please try again.",
        variant: "destructive",
      });
      setPaymentLoading(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = 500
  const taxRate = 0.05;
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  // Check for items with low stock
  const lowStockItems = cartItems.filter(item => 
    item.stock !== undefined && item.stock < item.quantity
  );

  // Check for unavailable items
  const unavailableItems = cartItems.filter(item => 
    item.stock === undefined || item.stock === 0
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-balance">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </Badge>
          )}
        </div>

        {cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some livestock to get started</p>
            <Button asChild>
              <Link href="/marketplace">
                Browse Marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        ) : (
          <>
            {/* Warnings */}
            {(lowStockItems.length > 0 || unavailableItems.length > 0) && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {unavailableItems.length > 0 && (
                    <p className="mb-2">
                      {unavailableItems.length} item{unavailableItems.length > 1 ? 's are' : ' is'} no longer available. Please remove them to proceed.
                    </p>
                  )}
                  {lowStockItems.length > 0 && (
                    <p>
                      {lowStockItems.length} item{lowStockItems.length > 1 ? 's have' : ' has'} insufficient stock. Please adjust quantities.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const isLowStock = item.stock !== undefined && item.stock < item.quantity;
                  const isUnavailable = item.stock === undefined || item.stock === 0;
                  const isProcessing = processingItems.includes(item.productId);
                  
                  return (
                    <Card key={item.productId} className={isUnavailable ? "opacity-60" : ""}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                            <Image 
                              src={item.productImage || "/placeholder.svg"} 
                              alt={item.productName} 
                              fill 
                              className="object-cover" 
                              sizes="128px"
                            />
                            {isUnavailable && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <Badge variant="destructive">Unavailable</Badge>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.productName}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  Seller: {item.sellerName}
                                </p>
                                {item.stock !== undefined && (
                                  <p className={`text-sm mt-1 ${isLowStock ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                    Stock: {item.stock} available
                                    {isLowStock && ` (Only ${item.stock} left!)`}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground mt-1">
                                  Unit Price: Tk {item.price.toLocaleString()}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10" 
                                onClick={() => handleRemoveItem(item.productId)}
                                disabled={isProcessing}
                              >
                                {isProcessing ? <Spinner className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
                              </Button>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 w-8 p-0" 
                                  onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                  disabled={isProcessing || item.quantity <= 1}
                                >
                                  {isProcessing ? <Spinner className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 w-8 p-0" 
                                  onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                  disabled={isProcessing || (item.stock !== undefined && item.quantity >= item.stock)}
                                >
                                  {isProcessing ? <Spinner className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                </Button>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-emerald-600">
                                  Tk {(item.price * item.quantity).toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} × Tk {item.price.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                        <span className="font-medium">Tk {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">Tk {shipping.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                        <span className="font-medium">Tk {tax.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-emerald-600">Tk {total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter promo code" 
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            if (promoCode) {
                              toast({
                                title: "Promo Code Applied",
                                description: "Discount will be calculated at checkout.",
                              });
                            } else {
                              toast({
                                title: "Enter a promo code",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleProceedToCheckout} 
                      disabled={
                        paymentLoading || 
                        cartItems.length === 0 || 
                        lowStockItems.length > 0 || 
                        unavailableItems.length > 0
                      }
                    >
                      {paymentLoading ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Checkout
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {cartItems.length === 0 || lowStockItems.length > 0 || unavailableItems.length > 0 ? (
                      <p className="text-sm text-destructive text-center mt-2">
                        Please resolve all issues before checkout
                      </p>
                    ) : null}

                    <Button variant="outline" className="w-full mt-2" asChild>
                      <Link href="/marketplace">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Continue Shopping
                      </Link>
                    </Button>

                    <div className="mt-4 text-xs text-muted-foreground">
                      <p>By proceeding, you agree to our Terms of Service and Privacy Policy.</p>
                      <p className="mt-2">Secure payment powered by SSLCommerz</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}