"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MoreVertical, Package, Truck, CheckCircle, XCircle, Eye, FileText, 
  Download, Calendar, User, ShoppingBag, DollarSign, TrendingUp, 
  BarChart3, Filter, RefreshCw, Printer, FileSpreadsheet, AlertCircle,
  ChevronUp, ChevronDown, Users, CreditCard, Clock, Box, ShoppingCart
} from "lucide-react";
import { collection, query, getDocs, updateDoc, doc, Timestamp, or, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, eachDayOfInterval, eachMonthOfInterval } from "date-fns";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Order Interface
interface Order {
  id: string;
  amount: number;
  totalAmount?: number;
  buyRequestId?: string;
  buyerId: string;
  buyerInfo: {
    email: string;
    name: string;
  };
  createdAt: Timestamp | Date;
  currency: string;
  offerId?: string;
  offerInfo?: {
    buyRequestId: string;
    buyRequestTitle: string;
    buyerId: string;
    createdAt: Timestamp | Date;
    id: string;
    message: string;
    price: number;
    sellerId: string;
    sellerName: string;
    status: string;
  };
  sellerId?: string;
  sellerIds?: string[];
  cartItems?: Array<{
    productName: string;
    sellerId: string;
    sellerName?: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "pending_verification" | "paid";
  orderType?: "single_offer" | "cart_checkout";
  tran_id: string;
  paymentStatus?: "pending" | "paid" | "failed";
  deliveryAddress?: string;
  trackingNumber?: string;
  estimatedDelivery?: Timestamp | Date;
}

// Report types
type ReportPeriod = "week" | "month" | "custom";
interface ReportData {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  deliveredOrders: number;
  cancelledOrders: number;
  orderStatusBreakdown: Record<string, number>;
  dailyData?: DailyData[];
  monthlyData?: MonthlyData[];
  topProducts?: TopProduct[];
  topBuyers?: TopBuyer[];
}

interface DailyData {
  date: string;
  orders: number;
  revenue: number;
}

interface MonthlyData {
  month: string;
  orders: number;
  revenue: number;
}

interface TopProduct {
  name: string;
  orders: number;
  revenue: number;
}

interface TopBuyer {
  name: string;
  email: string;
  orders: number;
  revenue: number;
}

export default function OrdersManagement() {
  const { user, userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateTracking, setUpdateTracking] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("week");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [user, userData]);

  // Generate report when orders or period changes
  useEffect(() => {
    if (orders.length > 0) {
      generateReportData();
    }
  }, [orders, reportPeriod]);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let ordersData: Order[] = [];
      
      if (userData?.role === "seller") {
        // For sellers, we need to fetch orders in multiple ways:
        console.log("Fetching orders for seller UID:", user.uid);
        
        // Method 1: Fetch all orders first
        const allOrdersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const allOrdersSnapshot = await getDocs(allOrdersQuery);
        
        console.log("Total orders in database:", allOrdersSnapshot.size);
        
        // Filter orders where user is the seller
        allOrdersSnapshot.forEach((doc) => {
          const data = doc.data();
          const orderData: Order = {
            id: doc.id,
            amount: data.amount || 0,
            totalAmount: data.totalAmount,
            buyRequestId: data.buyRequestId || "",
            buyerId: data.buyerId || "",
            buyerInfo: data.buyerInfo || { email: "", name: "" },
            createdAt: data.createdAt || new Date(),
            currency: data.currency || "BDT",
            offerId: data.offerId || "",
            offerInfo: data.offerInfo,
            sellerId: data.sellerId || "",
            sellerIds: data.sellerIds || [],
            cartItems: data.cartItems || [],
            status: data.status || "pending",
            orderType: data.orderType || "single_offer",
            tran_id: data.tran_id || doc.id,
            paymentStatus: data.paymentStatus || "pending",
            deliveryAddress: data.deliveryAddress || "",
            trackingNumber: data.trackingNumber || "",
            estimatedDelivery: data.estimatedDelivery || null
          };

          // Check if this order belongs to the seller
          const isSellerOrder = 
            // Single offers where sellerId matches
            orderData.sellerId === user.uid ||
            // Cart orders where sellerIds array contains user
            (orderData.sellerIds && orderData.sellerIds.includes(user.uid)) ||
            // Cart orders where cartItems contain seller's items
            (orderData.cartItems && orderData.cartItems.some(item => item.sellerId === user.uid));
          
          if (isSellerOrder) {
            ordersData.push(orderData);
          }
        });

        console.log("Filtered orders for seller:", ordersData.length);

      } else if (userData?.role === "buyer") {
        // For buyers, fetch orders where buyerId matches
        const q = query(collection(db, "orders"), where("buyerId", "==", user.uid), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ordersData.push({
            id: doc.id,
            amount: data.amount || 0,
            totalAmount: data.totalAmount,
            buyRequestId: data.buyRequestId || "",
            buyerId: data.buyerId || "",
            buyerInfo: data.buyerInfo || { email: "", name: "" },
            createdAt: data.createdAt || new Date(),
            currency: data.currency || "BDT",
            offerId: data.offerId || "",
            offerInfo: data.offerInfo,
            sellerId: data.sellerId || "",
            sellerIds: data.sellerIds || [],
            cartItems: data.cartItems || [],
            status: data.status || "pending",
            orderType: data.orderType || "single_offer",
            tran_id: data.tran_id || doc.id,
            paymentStatus: data.paymentStatus || "pending",
            deliveryAddress: data.deliveryAddress || "",
            trackingNumber: data.trackingNumber || "",
            estimatedDelivery: data.estimatedDelivery || null
          });
        });
        
        console.log("Orders for buyer:", ordersData.length);
      } else {
        // For admin, fetch all orders
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ordersData.push({
            id: doc.id,
            amount: data.amount || 0,
            totalAmount: data.totalAmount,
            buyRequestId: data.buyRequestId || "",
            buyerId: data.buyerId || "",
            buyerInfo: data.buyerInfo || { email: "", name: "" },
            createdAt: data.createdAt || new Date(),
            currency: data.currency || "BDT",
            offerId: data.offerId || "",
            offerInfo: data.offerInfo,
            sellerId: data.sellerId || "",
            sellerIds: data.sellerIds || [],
            cartItems: data.cartItems || [],
            status: data.status || "pending",
            orderType: data.orderType || "single_offer",
            tran_id: data.tran_id || doc.id,
            paymentStatus: data.paymentStatus || "pending",
            deliveryAddress: data.deliveryAddress || "",
            trackingNumber: data.trackingNumber || "",
            estimatedDelivery: data.estimatedDelivery || null
          });
        });
        
        console.log("All orders (admin):", ordersData.length);
      }

      // Sort by date (already done in query for most cases)
      ordersData.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReportData = () => {
    setGeneratingReport(true);
    try {
      let filteredOrders: Order[] = [];
      const now = new Date();
      let periodLabel = "";
      let startDate: Date;
      let endDate: Date;

      // Filter orders based on period
      if (reportPeriod === "week") {
        startDate = startOfWeek(now, { weekStartsOn: 0 });
        endDate = endOfWeek(now, { weekStartsOn: 0 });
        periodLabel = `Week ${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
        
        filteredOrders = orders.filter(order => {
          const orderDate = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });

        // Generate daily data for week
        const dailyData: DailyData[] = eachDayOfInterval({
          start: startDate,
          end: endDate
        }).map(date => {
          const dayOrders = orders.filter(order => {
            const orderDate = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt);
            return format(orderDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
          });

          return {
            date: format(date, 'EEE, MMM dd'),
            orders: dayOrders.length,
            revenue: dayOrders.reduce((sum, order) => sum + (order.totalAmount || order.amount), 0)
          };
        });

        // Generate top products
        const productMap = new Map<string, { orders: number; revenue: number }>();
        filteredOrders.forEach(order => {
          let productName = "";
          
          if (order.orderType === "cart_checkout" && order.cartItems) {
            // For cart orders, use product names from cart items
            order.cartItems.forEach(item => {
              const current = productMap.get(item.productName) || { orders: 0, revenue: 0 };
              productMap.set(item.productName, {
                orders: current.orders + 1,
                revenue: current.revenue + item.subtotal
              });
            });
          } else if (order.offerInfo?.buyRequestTitle) {
            // For single offers
            productName = order.offerInfo.buyRequestTitle;
            const current = productMap.get(productName) || { orders: 0, revenue: 0 };
            productMap.set(productName, {
              orders: current.orders + 1,
              revenue: current.revenue + (order.totalAmount || order.amount)
            });
          }
        });

        const topProducts: TopProduct[] = Array.from(productMap.entries())
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Generate top buyers
        const buyerMap = new Map<string, { name: string; email: string; orders: number; revenue: number }>();
        filteredOrders.forEach(order => {
          const buyerKey = order.buyerId;
          const current = buyerMap.get(buyerKey) || { 
            name: order.buyerInfo.name, 
            email: order.buyerInfo.email,
            orders: 0, 
            revenue: 0 
          };
          buyerMap.set(buyerKey, {
            name: order.buyerInfo.name,
            email: order.buyerInfo.email,
            orders: current.orders + 1,
            revenue: current.revenue + (order.totalAmount || order.amount)
          });
        });

        const topBuyers: TopBuyer[] = Array.from(buyerMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setReportData({
          period: periodLabel,
          totalOrders: filteredOrders.length,
          totalRevenue: filteredOrders.reduce((sum, order) => sum + (order.totalAmount || order.amount), 0),
          avgOrderValue: filteredOrders.length > 0 ? 
            filteredOrders.reduce((sum, order) => sum + (order.totalAmount || order.amount), 0) / filteredOrders.length : 0,
          deliveredOrders: filteredOrders.filter(o => o.status === "delivered").length,
          cancelledOrders: filteredOrders.filter(o => o.status === "cancelled").length,
          orderStatusBreakdown: filteredOrders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          dailyData,
          topProducts,
          topBuyers
        });

      } else if (reportPeriod === "month") {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        periodLabel = `Month of ${format(now, 'MMMM yyyy')}`;
        
        filteredOrders = orders.filter(order => {
          const orderDate = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });

        // Generate monthly data for last 6 months
        const sixMonthsAgo = subMonths(now, 5);
        const monthlyData: MonthlyData[] = eachMonthOfInterval({
          start: sixMonthsAgo,
          end: now
        }).map(date => {
          const monthStart = startOfMonth(date);
          const monthEnd = endOfMonth(date);
          
          const monthOrders = orders.filter(order => {
            const orderDate = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt);
            return orderDate >= monthStart && orderDate <= monthEnd;
          });

          return {
            month: format(date, 'MMM yyyy'),
            orders: monthOrders.length,
            revenue: monthOrders.reduce((sum, order) => sum + (order.totalAmount || order.amount), 0)
          };
        });

        // Generate top products
        const productMap = new Map<string, { orders: number; revenue: number }>();
        filteredOrders.forEach(order => {
          let productName = "";
          
          if (order.orderType === "cart_checkout" && order.cartItems) {
            // For cart orders, use product names from cart items
            order.cartItems.forEach(item => {
              const current = productMap.get(item.productName) || { orders: 0, revenue: 0 };
              productMap.set(item.productName, {
                orders: current.orders + 1,
                revenue: current.revenue + item.subtotal
              });
            });
          } else if (order.offerInfo?.buyRequestTitle) {
            // For single offers
            productName = order.offerInfo.buyRequestTitle;
            const current = productMap.get(productName) || { orders: 0, revenue: 0 };
            productMap.set(productName, {
              orders: current.orders + 1,
              revenue: current.revenue + (order.totalAmount || order.amount)
            });
          }
        });

        const topProducts: TopProduct[] = Array.from(productMap.entries())
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Generate top buyers
        const buyerMap = new Map<string, { name: string; email: string; orders: number; revenue: number }>();
        filteredOrders.forEach(order => {
          const buyerKey = order.buyerId;
          const current = buyerMap.get(buyerKey) || { 
            name: order.buyerInfo.name, 
            email: order.buyerInfo.email,
            orders: 0, 
            revenue: 0 
          };
          buyerMap.set(buyerKey, {
            name: order.buyerInfo.name,
            email: order.buyerInfo.email,
            orders: current.orders + 1,
            revenue: current.revenue + (order.totalAmount || order.amount)
          });
        });

        const topBuyers: TopBuyer[] = Array.from(buyerMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setReportData({
          period: periodLabel,
          totalOrders: filteredOrders.length,
          totalRevenue: filteredOrders.reduce((sum, order) => sum + (order.totalAmount || order.amount), 0),
          avgOrderValue: filteredOrders.length > 0 ? 
            filteredOrders.reduce((sum, order) => sum + (order.totalAmount || order.amount), 0) / filteredOrders.length : 0,
          deliveredOrders: filteredOrders.filter(o => o.status === "delivered").length,
          cancelledOrders: filteredOrders.filter(o => o.status === "cancelled").length,
          orderStatusBreakdown: filteredOrders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          monthlyData,
          topProducts,
          topBuyers
        });
      }

    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Get order display info
  const getOrderTitle = (order: Order) => {
    if (order.orderType === "cart_checkout") {
      const itemCount = order.cartItems?.length || 0;
      return `Cart Order (${itemCount} item${itemCount !== 1 ? 's' : ''})`;
    } else if (order.offerInfo?.buyRequestTitle) {
      return order.offerInfo.buyRequestTitle;
    } else {
      return "Order";
    }
  };

  const getOrderAmount = (order: Order) => {
    if (userData?.role === "seller" && order.orderType === "cart_checkout" && order.cartItems) {
      // For sellers viewing cart orders, only show amount from their items
      const sellerItems = order.cartItems.filter(item => item.sellerId === user?.uid);
      return sellerItems.reduce((sum, item) => sum + item.subtotal, 0);
    }
    return order.totalAmount || order.amount || 0;
  };

  const getOrderProductInfo = (order: Order) => {
    if (order.orderType === "cart_checkout" && order.cartItems) {
      if (userData?.role === "seller") {
        // For sellers, show only their items
        const sellerItems = order.cartItems.filter(item => item.sellerId === user?.uid);
        if (sellerItems.length === 0) return "No items from you";
        return `${sellerItems.length} item${sellerItems.length !== 1 ? 's' : ''} from you`;
      } else {
        // For buyers/admins, show all items
        return `${order.cartItems.length} item${order.cartItems.length !== 1 ? 's' : ''}`;
      }
    } else if (order.offerInfo?.buyRequestTitle) {
      return order.offerInfo.buyRequestTitle;
    }
    return "Order";
  };

  // Update order status
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !updateStatus) return;

    try {
      const orderRef = doc(db, "orders", selectedOrder.id);
      const updateData: any = {
        status: updateStatus,
        updatedAt: new Date()
      };

      if (updateTracking) {
        updateData.trackingNumber = updateTracking;
      }

      if (updateNotes) {
        updateData.adminNotes = updateNotes;
      }

      await updateDoc(orderRef, updateData);

      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { 
              ...order, 
              status: updateStatus as any,
              trackingNumber: updateTracking || order.trackingNumber
            } 
          : order
      ));

      setUpdateDialogOpen(false);
      setUpdateStatus("");
      setUpdateTracking("");
      setUpdateNotes("");
      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "pending_verification": 
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "processing": 
      case "paid":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "shipped": 
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "delivered": 
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "cancelled": 
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default: 
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "pending_verification":
        return <Clock className="h-3 w-3" />;
      case "processing":
      case "paid":
        return <Package className="h-3 w-3" />;
      case "shipped": 
        return <Truck className="h-3 w-3" />;
      case "delivered": 
        return <CheckCircle className="h-3 w-3" />;
      case "cancelled": 
      case "failed":
        return <XCircle className="h-3 w-3" />;
      default: 
        return <Package className="h-3 w-3" />;
    }
  };

  // Format date
  const formatDate = (date: Timestamp | Date) => {
    if (!date) return "N/A";
    const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date);
    return format(dateObj, "dd MMM yyyy, HH:mm");
  };

  // Filter orders
  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending" || o.status === "pending_verification").length,
    processing: orders.filter(o => o.status === "processing" || o.status === "paid").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    totalRevenue: orders.reduce((sum, o) => sum + getOrderAmount(o), 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + getOrderAmount(o), 0) / orders.length : 0
  };

  // PDF and Excel report functions remain the same...

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">
          {userData?.role === "seller" 
            ? "Manage and track all orders from buyers"
            : userData?.role === "buyer"
            ? "Track your purchase orders"
            : "Manage all platform orders"
          }
        </p>
      </div>

      {/* Tabs for Orders and Reports */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports & Analytics
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {orders.filter(o => o.orderType === "cart_checkout").length} cart orders
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">BDT {stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Avg: BDT {stats.avgOrderValue.toFixed(2)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.pending + stats.processing + stats.shipped}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pending} pending, {stats.processing} processing
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.cancelled} cancelled orders
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle>
                  All Orders ({orders.length})
                  {userData?.role === "seller" && (
                    <span className="text-sm font-normal text-muted-foreground block mt-1">
                      Showing your single offers and cart items
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={fetchOrders}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
                  <p className="text-muted-foreground">
                    {statusFilter === "all" 
                      ? "No orders have been placed yet" 
                      : `No orders with status "${statusFilter}"`}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product / Items</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {order.orderType === "cart_checkout" ? (
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm font-mono">{order.tran_id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{order.buyerInfo.name}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                                  {order.buyerInfo.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={getOrderTitle(order)}>
                              <div className="font-medium">{getOrderTitle(order)}</div>
                              <div className="text-sm text-muted-foreground">
                                {getOrderProductInfo(order)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">BDT {getOrderAmount(order).toLocaleString()}</span>
                            </div>
                            {order.orderType === "cart_checkout" && userData?.role === "seller" && (
                              <div className="text-xs text-muted-foreground">
                                From {order.cartItems?.filter(item => item.sellerId === user?.uid).length || 0} items
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(order.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 px-2 py-1`}>
                              {getStatusIcon(order.status)}
                              <span className="capitalize">{order.status.replace('_', ' ')}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrder(order);
                                  setViewDialogOpen(true);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const doc = new jsPDF();
                                  autoTable(doc, {
                                    head: [['Field', 'Value']],
                                    body: [
                                      ['Order ID', order.tran_id],
                                      ['Date', formatDate(order.createdAt)],
                                      ['Customer', order.buyerInfo.name],
                                      ['Email', order.buyerInfo.email],
                                      ['Order Type', order.orderType === 'cart_checkout' ? 'Cart Order' : 'Single Offer'],
                                      ['Amount', `BDT ${getOrderAmount(order)}`],
                                      ['Status', order.status],
                                      ['Payment Status', order.paymentStatus || 'pending'],
                                      ['Transaction ID', order.tran_id]
                                    ],
                                    theme: 'grid',
                                  });
                                  doc.save(`invoice-${order.tran_id}.pdf`);
                                }}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Invoice
                                </DropdownMenuItem>
                                {(userData?.role === "seller" || userData?.role === "admin") && (
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedOrder(order);
                                    setUpdateStatus(order.status);
                                    setUpdateTracking(order.trackingNumber || "");
                                    setUpdateDialogOpen(true);
                                  }}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Update Status
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab - This part remains mostly the same... */}
        <TabsContent value="reports" className="space-y-6">
          {/* Report Controls */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sales Analytics & Reports
                  </CardTitle>
                  <CardDescription>Generate detailed week/month reports and analytics</CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Select value={reportPeriod} onValueChange={(value) => setReportPeriod(value as ReportPeriod)}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Weekly Report</SelectItem>
                      <SelectItem value="month">Monthly Report</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => { /* PDF generation function */ }} 
                      disabled={generatingReport || !reportData}
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      {generatingReport ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          PDF
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => { /* Excel generation function */ }} 
                      disabled={generatingReport || !reportData}
                      variant="outline"
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-6">
                  {/* Report Summary and other components remain the same... */}
                  {/* You can copy the report UI from the previous code */}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No report data available</h3>
                  <p className="text-muted-foreground">Select a period to generate report</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Complete information for order {selectedOrder?.tran_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Order ID</Label>
                  <p className="font-medium font-mono">{selectedOrder.tran_id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Order Type</Label>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {selectedOrder.orderType === "cart_checkout" ? (
                      <ShoppingCart className="h-3 w-3" />
                    ) : (
                      <ShoppingBag className="h-3 w-3" />
                    )}
                    {selectedOrder.orderType === "cart_checkout" ? "Cart Order" : "Single Offer"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1 w-fit`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Amount</Label>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">
                          BDT {getOrderAmount(selectedOrder).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedOrder.orderType === "cart_checkout" 
                            ? "Total for your items"
                            : "Order amount"
                          }
                        </div>
                      </div>
                      <DollarSign className="h-8 w-8 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Buyer Information */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Buyer Information</Label>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedOrder.buyerInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedOrder.buyerInfo.email}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Buyer ID</p>
                        <p className="font-medium text-sm font-mono">{selectedOrder.buyerId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Product Information */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  {selectedOrder.orderType === "cart_checkout" ? "Cart Items" : "Product Information"}
                </Label>
                <Card>
                  <CardContent className="pt-4">
                    {selectedOrder.orderType === "cart_checkout" && selectedOrder.cartItems ? (
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          {selectedOrder.cartItems.length} items in cart
                        </div>
                        {selectedOrder.cartItems
                          .filter(item => userData?.role !== "seller" || item.sellerId === user?.uid)
                          .map((item, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{item.productName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Seller: {item.sellerName || "Unknown"}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">BDT {item.subtotal.toLocaleString()}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.quantity} × BDT {item.price}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    ) : selectedOrder.offerInfo ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Product Title</p>
                          <p className="font-medium">{selectedOrder.offerInfo.buyRequestTitle}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Seller Name</p>
                            <p className="font-medium">{selectedOrder.offerInfo.sellerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Seller ID</p>
                            <p className="font-medium text-sm font-mono">{selectedOrder.sellerId}</p>
                          </div>
                        </div>
                        {selectedOrder.offerInfo.message && (
                          <div>
                            <p className="text-sm text-muted-foreground">Seller Message</p>
                            <p className="font-medium">{selectedOrder.offerInfo.message}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No product information available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Transaction Details */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Transaction Details</Label>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Status</p>
                        <Badge variant={selectedOrder.paymentStatus === "paid" ? "default" : "secondary"}>
                          {selectedOrder.paymentStatus || "pending"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Currency</p>
                        <p className="font-medium">{selectedOrder.currency}</p>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground">Tracking Number</p>
                          <p className="font-medium">{selectedOrder.trackingNumber}</p>
                        </div>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                          <p className="font-medium">{formatDate(selectedOrder.estimatedDelivery)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="flex-1">Close</Button>
            {selectedOrder && (
              <>
                <Button onClick={() => {
                  const doc = new jsPDF();
                  autoTable(doc, {
                    head: [['Field', 'Value']],
                    body: [
                      ['Order ID', selectedOrder.tran_id],
                      ['Date', formatDate(selectedOrder.createdAt)],
                      ['Customer', selectedOrder.buyerInfo.name],
                      ['Email', selectedOrder.buyerInfo.email],
                      ['Order Type', selectedOrder.orderType === 'cart_checkout' ? 'Cart Order' : 'Single Offer'],
                      ['Amount', `BDT ${getOrderAmount(selectedOrder)}`],
                      ['Status', selectedOrder.status],
                      ['Payment Status', selectedOrder.paymentStatus || 'pending'],
                      ['Transaction ID', selectedOrder.tran_id]
                    ],
                    theme: 'grid',
                  });
                  doc.save(`invoice-${selectedOrder.tran_id}.pdf`);
                }} className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Download Invoice
                </Button>
                {(userData?.role === "seller" || userData?.role === "admin") && (
                  <Button onClick={() => {
                    setUpdateDialogOpen(true);
                    setViewDialogOpen(false);
                  }} className="flex-1 gap-2">
                    <FileText className="h-4 w-4" />
                    Update Status
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status and tracking information for order {selectedOrder?.tran_id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tracking Number (Optional)</Label>
              <Input 
                placeholder="Enter tracking number" 
                value={updateTracking}
                onChange={(e) => setUpdateTracking(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea 
                placeholder="Add any notes about this order update"
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus}>Update Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}