"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, addDoc, serverTimestamp, orderBy, onSnapshot } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"
import { ShoppingBag, Package, CreditCard, Truck, CheckCircle, XCircle, Clock, Filter, Calendar, RefreshCw } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Types
type BuyRequest = {
  id: string
  title: string
  createdAt: any
  status: 'active' | 'closed'
}

type Offer = {
  id: string
  buyRequestId: string
  sellerId: string
  sellerName: string
  price: number
  message: string
  createdAt: any
  status: 'pending' | 'accepted' | 'rejected'
}

type Order = {
  id: string;
  tran_id: string;
  amount: number;
  totalAmount?: number; // Add this line
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'failed' | 'cancelled' | 'refunded' | 'pending_verification';
  orderType?: 'single_offer' | 'cart_checkout';
  createdAt: any;
  offerInfo?: {
    buyRequestTitle: string;
    sellerName: string;
    price: number;
  };
  cartItems?: Array<{
    productName: string;
    quantity: number;
    price: number;
    sellerName: string;
  }>;
  buyerId: string;
  sellerId?: string;
  sellerIds?: string[];
  buyerInfo?: {
    name: string;
    email: string;
  };
}

type FilterState = {
  orderType: 'all' | 'single_offer' | 'cart_checkout';
  status: 'all' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'failed' | 'cancelled';
  timeRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'newest' | 'oldest' | 'price_high' | 'price_low';
}

export default function BuyerOrdersPage() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const [requestsWithOffers, setRequestsWithOffers] = useState<{ request: BuyRequest; offers: Offer[] }[]>([])
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'offers'
  
  const [filters, setFilters] = useState<FilterState>({
    orderType: 'all',
    status: 'all',
    timeRange: 'all',
    sortBy: 'newest',
  });

  const fetchOrders = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Use real-time listener for orders to get instant updates
      const ordersQuery = query(
        collection(db, "orders"), 
        where("buyerId", "==", user.uid), 
        orderBy("createdAt", "desc")
      );
      
      const unsubscribe = onSnapshot(ordersQuery, (ordersSnapshot) => {
        const fetchedBuyerOrders = ordersSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Order[];
        
        console.log(`Real-time orders update: ${fetchedBuyerOrders.length} orders`);
        setBuyerOrders(fetchedBuyerOrders);
        setFilteredOrders(fetchedBuyerOrders);
        
        // Only fetch buy requests and offers if not already loaded or force refresh
        if (requestsWithOffers.length === 0 || forceRefresh) {
          fetchBuyRequestsAndOffers();
        } else {
          setLoading(false);
          setRefreshing(false);
        }
      }, (error) => {
        console.error("Error in orders listener:", error);
        setLoading(false);
        setRefreshing(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const fetchBuyRequestsAndOffers = async () => {
    if (!user) return;
    
    try {
      // Fetch buy requests
      const requestsQuery = query(
        collection(db, "buy-requests"), 
        where("buyerId", "==", user.uid), 
        orderBy("createdAt", "desc")
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      const buyRequests = requestsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as BuyRequest[];

      // Fetch offers for each request
      const populatedRequests = await Promise.all(
        buyRequests.map(async (request) => {
          const offersQuery = query(
            collection(db, "offers"), 
            where("buyRequestId", "==", request.id),
            orderBy("createdAt", "desc")
          );
          const offersSnapshot = await getDocs(offersQuery);
          const offers = offersSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          })) as Offer[];
          return { request, offers };
        })
      );

      console.log(`Fetched ${populatedRequests.length} buy requests with offers`);
      setRequestsWithOffers(populatedRequests);
    } catch (error) {
      console.error("Error fetching buy requests and offers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      const unsubscribePromise = fetchOrders();
      
      return () => {
        // Cleanup subscription
        unsubscribePromise.then(unsubscribe => {
          if (unsubscribe) unsubscribe();
        });
      };
    }
  }, [user, fetchOrders]);

  // Apply filters whenever filters or orders change
  useEffect(() => {
    applyFilters();
  }, [filters, buyerOrders]);

  const applyFilters = () => {
    let result = [...buyerOrders];

    // Filter by order type
    if (filters.orderType !== 'all') {
      result = result.filter(order => order.orderType === filters.orderType);
    }

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(order => order.status === filters.status);
    }

    // Filter by time range
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const orderDate = (date: any) => date ? date.toDate() : new Date();
      
      result = result.filter(order => {
        const createdAt = orderDate(order.createdAt);
        const diffInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.timeRange) {
          case 'today':
            return diffInDays === 0;
          case 'week':
            return diffInDays <= 7;
          case 'month':
            return diffInDays <= 30;
          default:
            return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      const dateA = a.createdAt ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt ? b.createdAt.toDate().getTime() : 0;
      const priceA = a.amount || a.totalAmount || 0;
      const priceB = b.amount || b.totalAmount || 0;

      switch (filters.sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'price_high':
          return priceB - priceA;
        case 'price_low':
          return priceA - priceB;
        default:
          return dateB - dateA;
      }
    });

    setFilteredOrders(result);
  };

  const handleRefresh = () => {
    fetchOrders(true);
    toast.success("Refreshing orders...");
  };

  const clearFilters = () => {
    setFilters({
      orderType: 'all',
      status: 'all',
      timeRange: 'all',
      sortBy: 'newest',
    });
  };

  const handleMessageSeller = async (sellerId: string) => {
    if (!user) return;

    try {
      const conversationQuery = query(
        collection(db, "conversations"),
        where("participants", "array-contains", user.uid)
      );

      const querySnapshot = await getDocs(conversationQuery);
      
      const foundConversationDoc = querySnapshot.docs.find(doc => {
        const data = doc.data();
        return data && data.participants && Array.isArray(data.participants) && data.participants.includes(sellerId);
      });

      if (foundConversationDoc) {
        router.push(`/messages/${foundConversationDoc.id}`);
      } else {
        const newConversationRef = await addDoc(collection(db, "conversations"), {
          participants: [user.uid, sellerId],
          lastUpdatedAt: serverTimestamp(),
          lastRead: {
            [user.uid]: serverTimestamp()
          }
        });
        router.push(`/messages/${newConversationRef.id}`);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  const handleInitiatePayment = async (offer: Offer) => {
    if (!user || !userData) {
      toast.error("Please log in to proceed with payment.");
      return;
    }
    setPaymentLoading(true);
    try {
      const buyerDetails = {
        uid: user.uid,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        phone: userData.phone || '01700000000',
        address: userData.address || 'Dhaka, Bangladesh',
        city: userData.city || 'Dhaka',
        state: userData.state || 'Dhaka',
        postcode: userData.postcode || '1212',
      };

      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offer, buyer: buyerDetails }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        toast.success("Redirecting to payment gateway...");
        window.location.href = data.url;
      } else {
        throw new Error(data.error || data.failedreason || "Failed to initiate payment.");
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error((error as Error).message || "Payment initiation failed.");
      setPaymentLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('BDT', 'Tk');
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
      case 'pending_verification':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'paid':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
      case 'pending_verification':
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case 'paid':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case 'shipped':
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case 'delivered':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'failed':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case 'cancelled':
      case 'refunded':
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getOrderTitle = (order: Order) => {
    if (order.orderType === 'cart_checkout') {
      const itemCount = order.cartItems?.length || 0;
      return `Cart Order (${itemCount} item${itemCount !== 1 ? 's' : ''})`;
    } else if (order.offerInfo?.buyRequestTitle) {
      return order.offerInfo.buyRequestTitle;
    } else {
      return "Order";
    }
  };

  const getSellerInfo = (order: Order) => {
    if (order.orderType === 'cart_checkout') {
      const sellerCount = order.sellerIds?.length || 0;
      return sellerCount > 1 ? `${sellerCount} sellers` : (order.cartItems?.[0]?.sellerName || "Seller");
    } else if (order.offerInfo?.sellerName) {
      return order.offerInfo.sellerName;
    } else if (order.sellerId) {
      return "Seller";
    } else {
      return "Multiple sellers";
    }
  };

  // Stats for dashboard
  const orderStats = {
    total: buyerOrders.length,
    single_offers: buyerOrders.filter(o => o.orderType === 'single_offer').length,
    cart_orders: buyerOrders.filter(o => o.orderType === 'cart_checkout').length,
    pending: buyerOrders.filter(o => o.status === 'pending' || o.status === 'pending_verification').length,
    delivered: buyerOrders.filter(o => o.status === 'delivered').length,
  };

  if (loading && !refreshing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your purchases</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Button asChild size="sm">
              <Link href="/marketplace">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Shop More
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs for Orders vs Offers */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders ({orderStats.total})
            </TabsTrigger>
            <TabsTrigger value="offers" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Offers ({requestsWithOffers.reduce((sum, { offers }) => sum + offers.length, 0)})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'orders' ? (
        <>
          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orderStats.total}</p>
                  </div>
                  <Package className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Single Offers</p>
                    <p className="text-2xl font-bold">{orderStats.single_offers}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cart Orders</p>
                    <p className="text-2xl font-bold">{orderStats.cart_orders}</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{orderStats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Filter Orders</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* Order Type Filter */}
                  <Select 
                    value={filters.orderType} 
                    onValueChange={(value: any) => setFilters(prev => ({ ...prev, orderType: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Order Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="single_offer">Single Offers</SelectItem>
                      <SelectItem value="cart_checkout">Cart Orders</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select 
                    value={filters.status} 
                    onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Time Range Filter */}
                  <Select 
                    value={filters.timeRange} 
                    onValueChange={(value: any) => setFilters(prev => ({ ...prev, timeRange: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort By Filter */}
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
              
              {/* Active Filters Display */}
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.orderType !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {filters.orderType === 'single_offer' ? 'Single Offers' : 'Cart Orders'}
                  </Badge>
                )}
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status}
                  </Badge>
                )}
                {filters.timeRange !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {filters.timeRange === 'today' ? 'Today' : 
                     filters.timeRange === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                  </Badge>
                )}
                {filteredOrders.length < buyerOrders.length && (
                  <Badge variant="outline">
                    Showing {filteredOrders.length} of {buyerOrders.length} orders
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {buyerOrders.length === 0 
                    ? "You haven't placed any orders yet." 
                    : "No orders match your current filters."}
                </p>
                {buyerOrders.length === 0 ? (
                  <Button asChild>
                    <Link href="/marketplace">Browse Marketplace</Link>
                  </Button>
                ) : (
                  <Button onClick={clearFilters}>Clear Filters</Button>
                )}
              </Card>
            ) : (
              filteredOrders.map(order => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(order.status)}
                          <CardTitle className="text-lg">
                            {getOrderTitle(order)}
                            {order.orderType === 'cart_checkout' && (
                              <Badge variant="outline" className="ml-2">
                                Cart
                              </Badge>
                            )}
                          </CardTitle>
                        </div>
                        <CardDescription>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span>
                              Order ID: <span className="font-mono text-sm">{order.tran_id}</span>
                            </span>
                            <span className="hidden sm:block">•</span>
                            <span>
                              {order.createdAt ? format(order.createdAt.toDate(), "PPP 'at' p") : 'Date not available'}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge className={getStatusBadgeColor(order.status)}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatCurrency(order.amount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getSellerInfo(order).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {getSellerInfo(order)}
                          </span>
                        </div>
                        
                        {/* Show item count for cart orders */}
                        {order.orderType === 'cart_checkout' && order.cartItems && (
                          <div className="text-sm text-muted-foreground">
                            Items: {order.cartItems.length}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/orders/${order.id}`} className="flex-1">
                          <Button className="w-full" size="sm">
                            View Details
                          </Button>
                        </Link>
                        
                        {/* Show contact button for specific order types */}
                        {(order.orderType === 'single_offer' || order.sellerId) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (order.sellerId) {
                                handleMessageSeller(order.sellerId);
                              } else if (order.sellerIds?.[0]) {
                                handleMessageSeller(order.sellerIds[0]);
                              }
                            }}
                          >
                            Contact Seller
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        /* Offers Tab */
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">My Buy Requests & Received Offers</h2>
          
          {requestsWithOffers.length === 0 ? (
            <Card className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No buy requests yet</h3>
              <p className="text-muted-foreground mb-6">Create a buy request to receive offers from sellers.</p>
              <Button asChild>
                <Link href="/buyer/requests/new">Create Buy Request</Link>
              </Button>
            </Card>
          ) : (
            requestsWithOffers.map(({ request, offers }) => (
              <Card key={request.id} className={request.status === 'closed' ? 'bg-gray-50/70' : ''}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <CardTitle>{request.title}</CardTitle>
                      <CardDescription>
                        Posted on {request.createdAt ? format(request.createdAt.toDate(), "PPP") : 'N/A'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.status === 'closed' ? (
                        <Badge variant="secondary">Closed</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Active
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <h3 className="font-semibold mb-4">Offers Received</h3>
                  
                  {offers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No offers received yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {offers.map(offer => (
                        <div key={offer.id} className="p-4 border rounded-lg">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Avatar>
                                  <AvatarFallback>{offer.sellerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">{offer.sellerName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {offer.createdAt ? format(offer.createdAt.toDate(), "PPp") : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <p className="text-muted-foreground mb-2">{offer.message}</p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <p className="text-xl font-bold text-emerald-600">
                                {formatCurrency(offer.price)}
                              </p>
                              
                              <div className="flex gap-2">
                                {offer.status === 'accepted' ? (
                                  <Badge className="bg-green-100 text-green-800">Accepted & Paid</Badge>
                                ) : offer.status === 'rejected' ? (
                                  <Badge variant="destructive">Rejected</Badge>
                                ) : request.status === 'closed' ? (
                                  <Badge variant="secondary">Not Selected</Badge>
                                ) : (
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleMessageSeller(offer.sellerId)}
                                      disabled={paymentLoading}
                                    >
                                      Message
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleInitiatePayment(offer)}
                                      disabled={paymentLoading}
                                    >
                                      {paymentLoading ? 'Processing...' : 'Accept & Pay'}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}