"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Store, Package, Clock, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore"
import Link from "next/link"
import { format } from "date-fns"
import { Spinner } from "@/components/ui/spinner"

// Types (copied from app/buyer/orders/page.tsx for now, ideally shared)
type Order = {
  id: string;
  tran_id: string;
  amount: number;
  totalAmount?: number;
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

export default function BuyerPage() {
  const { user, loading: authLoading } = useAuth();
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [deliveredOrders, setDeliveredOrders] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [savedSellersCount, setSavedSellersCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Orders Data (Real-time)
        const ordersQuery = query(
          collection(db, "orders"),
          where("buyerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
          const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
          setTotalOrders(ordersData.length);
          setPendingOrders(ordersData.filter(order => order.status === 'pending' || order.status === 'pending_verification').length);
          setDeliveredOrders(ordersData.filter(order => order.status === 'delivered').length);
          setRecentOrders(ordersData.slice(0, 5)); // Get top 5 recent orders
        });

        // Wishlist Count
        const wishlistSnapshot = await getDocs(collection(db, `users/${user.uid}/wishlist`));
        setWishlistCount(wishlistSnapshot.size);

        // Saved Sellers Count (assuming a 'savedSellers' subcollection or similar)
        // For now, let's assume it's a subcollection. If not, this will need adjustment.
        const savedSellersSnapshot = await getDocs(collection(db, `users/${user.uid}/savedSellers`));
        setSavedSellersCount(savedSellersSnapshot.size);

        setLoading(false);
        return () => unsubscribeOrders(); // Cleanup on unmount
      } catch (error) {
        console.error("Error fetching buyer dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('BDT', 'Tk');
  }

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Buyer Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders} pending, {deliveredOrders} delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wishlistCount}</div>
            <p className="text-xs text-muted-foreground">items in your wishlist</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Sellers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedSellersCount}</div>
            <p className="text-xs text-muted-foreground">sellers you follow</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No recent orders.</TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/orders/${order.id}`} className="hover:underline">
                        #{order.tran_id.substring(0, 8)}...
                      </Link>
                    </TableCell>
                    <TableCell>{getOrderTitle(order)}</TableCell>
                    <TableCell>
                      {order.createdAt ? format(order.createdAt.toDate(), "yyyy-MM-dd") : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(order.status)}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.totalAmount || order.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
