"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, Wallet, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, query, where, getDocs, orderBy, limit, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export default function SellerDashboard() {
  const { user, userData, loading: authLoading } = useAuth();
  const [productCount, setProductCount] = useState<number | null>(null);
  const [activeOrderCount, setActiveOrderCount] = useState<number | null>(null);
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<DocumentData[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchDashboardStats = async () => {
        setStatsLoading(true);
        try {
          // --- Queries ---
          const productsQuery = query(collection(db, "products"), where("sellerId", "==", user.uid));
          const activeOrdersQuery = query(collection(db, "orders"), where("sellerId", "==", user.uid), where("status", "in", ["pending", "processing"]));
          const completedOrdersQuery = query(collection(db, "orders"), where("sellerId", "==", user.uid), where("status", "==", "completed"));
          const recentOrdersQuery = query(collection(db, "orders"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));

          const [
            productsSnapshot, 
            activeOrdersSnapshot, 
            completedOrdersSnapshot,
            recentOrdersSnapshot
          ] = await Promise.all([
            getDocs(productsQuery),
            getDocs(activeOrdersQuery),
            getDocs(completedOrdersQuery),
            getDocs(recentOrdersQuery)
          ]);

          // --- Calculations & State Updates ---
          const sales = completedOrdersSnapshot.docs.reduce((acc, doc) => acc + (doc.data().totalPrice || 0), 0);
          const orders = recentOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          setProductCount(productsSnapshot.size);
          setActiveOrderCount(activeOrdersSnapshot.size);
          setTotalSales(sales);
          setRecentOrders(orders);

        } catch (error) {
          console.error("Error fetching dashboard stats: ", error);
          setProductCount(0);
          setActiveOrderCount(0);
          setTotalSales(0);
          setRecentOrders([]);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchDashboardStats();
    } else if (!authLoading) {
      setStatsLoading(false);
    }
  }, [user, authLoading]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const stats = [
    { title: "Total Products", value: productCount, description: "All time", icon: Package, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Active Orders", value: activeOrderCount, description: "Pending or Processing", icon: ShoppingCart, color: "text-emerald-600", bgColor: "bg-emerald-100" },
    { title: "Total Sales", value: formatCurrency(totalSales), description: "All time completed orders", icon: TrendingUp, color: "text-amber-600", bgColor: "bg-amber-100" },
    { title: "Wallet Balance", value: "$850.50", description: "Available for withdrawal", icon: Wallet, color: "text-purple-600", bgColor: "bg-purple-100" },
  ];

  const lowStockProducts = [
    { name: "Organic Tomatoes", stock: 5, limit: 10 },
    { name: "Fresh Spinach", stock: 2, limit: 15 },
    { name: "Honey (500g)", stock: 8, limit: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        {authLoading ? <Skeleton className="h-9 w-1/2" /> : <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userData?.firstName || 'Seller'}</h1>}
        <p className="text-muted-foreground">Here's what's happening with your farm today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stat.title === 'Total Sales' ? stat.value : (stat.value ?? 0)}</div>}
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600"><ShoppingCart className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName || 'N/A'} • {order.itemCount || 0} items • {formatCurrency(order.totalPrice)}</p>
                    </div>
                    <Badge variant="outline" className="capitalize text-emerald-600 border-emerald-200">{order.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No recent orders</EmptyTitle>
                  <EmptyDescription>
                    You have no recent orders. When you get a new order, it will show up here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {lowStockProducts.map((product) => (
                <div key={product.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground">{product.stock} / {product.limit} units</span>
                  </div>
                  <Progress value={(product.stock / product.limit) * 100} className="h-2 bg-amber-100" indicatorClassName="bg-amber-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
