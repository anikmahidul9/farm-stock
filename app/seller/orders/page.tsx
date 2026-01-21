"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, getDocs, orderBy } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreVertical, Eye, ShoppingCart, Package, AlertCircle, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Order = {
  id: string;
  tran_id: string;
  amount: number;
  totalAmount?: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'failed' | 'cancelled' | 'refunded' | 'pending_verification';
  orderType?: 'single_offer' | 'cart_checkout';
  createdAt: any;
  buyerInfo?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  cartItems?: Array<{
    productName: string;
    sellerId: string;
    sellerName?: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  sellerId?: string;
  sellerIds?: string[];
  paidAmount?: string;
  shippingCost?: number;
  taxAmount?: number;
};

export default function SellerOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrders = useCallback(async (forceRefresh = false) => {
    if (!user?.uid) return;
    
    if (forceRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    try {
      console.log("Fetching all orders for filtering...")
      
      // Fetch ALL orders and filter on client side
      const ordersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      )
      
      const snapshot = await getDocs(ordersQuery)
      console.log("Total orders in database:", snapshot.size)
      
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
      
      // Filter orders where user is the seller
      const sellerOrders = allOrders.filter(order => {
        // Check for single offers
        if (order.sellerId === user.uid) {
          console.log("Found single offer:", order.tran_id)
          return true
        }
        
        // Check for cart orders
        if (order.sellerIds && Array.isArray(order.sellerIds) && order.sellerIds.includes(user.uid)) {
          console.log("Found cart order:", order.tran_id)
          return true
        }
        
        // Check cart items for sellerId
        if (order.cartItems && Array.isArray(order.cartItems)) {
          const hasSellerItems = order.cartItems.some(item => item.sellerId === user.uid)
          if (hasSellerItems) {
            console.log("Found cart order via cartItems:", order.tran_id)
            return true
          }
        }
        
        return false
      })
      
      console.log("Filtered orders for seller:", sellerOrders.length)
      console.log("Order details:", sellerOrders.map(o => ({
        tran_id: o.tran_id,
        orderType: o.orderType,
        status: o.status,
        buyerName: o.buyerInfo?.name,
        amount: o.amount,
        sellerId: o.sellerId,
        sellerIds: o.sellerIds,
        cartItems: o.cartItems?.map(ci => ({
          sellerId: ci.sellerId,
          productName: ci.productName,
          quantity: ci.quantity
        }))
      })))
      
      setOrders(sellerOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.uid])

  useEffect(() => {
    if (user?.uid) {
      fetchOrders()
    }
  }, [user?.uid, fetchOrders])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('BDT', '৳')
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      case 'pending_verification': return 'bg-orange-100 text-orange-800 hover:bg-orange-100'
      case 'paid': return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'shipped': return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
      case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'failed': return 'bg-red-100 text-red-800 hover:bg-red-100'
      case 'cancelled': return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      case 'refunded': return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Awaiting Payment'
      case 'pending_verification': return 'Payment Verification'
      case 'paid': return 'Paid'
      case 'shipped': return 'Shipped'
      case 'delivered': return 'Delivered'
      case 'failed': return 'Payment Failed'
      case 'cancelled': return 'Cancelled'
      case 'refunded': return 'Refunded'
      default: return status
    }
  }

  const getOrderAmount = (order: Order) => {
    if (order.orderType === 'cart_checkout' && order.cartItems) {
      // For cart orders, calculate total for items from this seller
      const sellerItems = order.cartItems.filter(item => item.sellerId === user?.uid)
      const total = sellerItems.reduce((sum, item) => sum + item.subtotal, 0)
      console.log(`Cart order ${order.tran_id}: seller items:`, sellerItems.length, "total:", total)
      return total
    }
    // For single offers, use the order amount
    console.log(`Single offer ${order.tran_id}: amount:`, order.amount)
    return order.amount || 0
  }

  const getBuyerName = (order: Order) => {
    return order.buyerInfo?.name || "Customer"
  }

  const getOrderDetails = (order: Order) => {
    if (order.orderType === 'cart_checkout' && order.cartItems) {
      const sellerItems = order.cartItems.filter(item => item.sellerId === user?.uid)
      if (sellerItems.length === 0) return "No items from you"
      
      const totalItems = sellerItems.reduce((sum, item) => sum + item.quantity, 0)
      const itemNames = sellerItems.map(item => item.productName).join(", ")
      return `${totalItems} item${totalItems > 1 ? 's' : ''}: ${itemNames.substring(0, 30)}${itemNames.length > 30 ? '...' : ''}`
    }
    return "Single Offer"
  }

  const getItemsCount = (order: Order) => {
    if (order.orderType === 'cart_checkout' && order.cartItems) {
      const sellerItems = order.cartItems.filter(item => item.sellerId === user?.uid)
      return sellerItems.reduce((sum, item) => sum + item.quantity, 0)
    }
    return 1
  }

  const getFormattedDate = (order: Order) => {
    if (!order.createdAt) return 'N/A'
    
    try {
      // Check if createdAt is a Firestore Timestamp
      if (order.createdAt.toDate) {
        return format(order.createdAt.toDate(), "MMM d, yyyy")
      }
      // If it's already a Date object
      if (order.createdAt instanceof Date) {
        return format(order.createdAt, "MMM d, yyyy")
      }
      // If it's a string, try to parse it
      if (typeof order.createdAt === 'string') {
        return format(new Date(order.createdAt), "MMM d, yyyy")
      }
    } catch (error) {
      console.error("Error formatting date:", error, order.createdAt)
    }
    
    return 'N/A'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">My Sales</h1>
          <p className="text-muted-foreground mt-1">Track and manage all your orders from buyers</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

    

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {orders.filter(o => ['paid', 'shipped'].includes(o.status)).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Paid & shipping</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(orders.reduce((sum, order) => sum + getOrderAmount(order), 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Gross sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Shipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {orders.filter(o => o.status === 'paid').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready to ship</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            Showing {orders.length} order{orders.length !== 1 ? 's' : ''} from buyers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6">
                {user ? "You haven't received any orders from buyers yet." : "Please log in to view your orders."}
              </p>
              {user && (
                <Button asChild>
                  <Link href="/seller/dashboard">Go to Dashboard</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const orderAmount = getOrderAmount(order)
                    const itemsCount = getItemsCount(order)
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">
                          <div className="flex items-center gap-2">
                            {order.orderType === 'cart_checkout' && (
                              <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                            )}
                            {order.tran_id || `#${order.id.substring(0, 8)}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{getBuyerName(order)}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.orderType === 'cart_checkout' ? 'Cart Order' : 'Single Offer'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{itemsCount} item{itemsCount !== 1 ? 's' : ''}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {getOrderDetails(order)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-600">
                          {formatCurrency(orderAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status === 'pending_verification' && (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {getStatusText(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getFormattedDate(order)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/orders/${order.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details & Track
                                </Link>
                              </DropdownMenuItem>
                              {order.status === 'paid' && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/orders/${order.id}`}>
                                    <Package className="h-4 w-4 mr-2" />
                                    Update to Shipped
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {order.status === 'shipped' && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/orders/${order.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Mark as Delivered
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}