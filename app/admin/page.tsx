"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, ShoppingCart, DollarSign, RefreshCw, Download, ChevronDown, ChevronRight } from "lucide-react"
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameWeek, isSameMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from "@/lib/utils";

// Define Order type (similar to buyer/orders/page.tsx)
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

type SalesReportEntry = {
  period: string;
  totalSales: number;
  totalOrders: number;
  periodStart: Date;
  periodEnd: Date;
  orders: Order[];
}

type DetailedPeriodData = {
  period: string;
  orders: Order[];
  totalSales: number;
  totalOrders: number;
}

export default function AdminDashboardPage() {
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [newUsersLastMonth, setNewUsersLastMonth] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedReportType, setSelectedReportType] = useState<'monthly' | 'weekly'>('monthly');
  const [salesReportData, setSalesReportData] = useState<SalesReportEntry[]>([]);
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [detailedPeriodData, setDetailedPeriodData] = useState<DetailedPeriodData | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Products Count (Real-time)
      const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
        setProductCount(snapshot.size);
      });

      // Users Count (Real-time)
      const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        setUserCount(snapshot.size);
        
        // Calculate new users in the last month
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        let newUsers = 0;
        snapshot.forEach(doc => {
          const userData = doc.data();
          if (userData.createdAt && userData.createdAt.toDate() > oneMonthAgo) {
            newUsers++;
          }
        });
        setNewUsersLastMonth(newUsers);
      });

      // Orders Data (Real-time)
      const unsubscribeOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
        setAllOrders(ordersData);
        setOrderCount(ordersData.length);

        const deliveredOrders = ordersData.filter(order => order.status === 'delivered');
        const totalDeliveredAmount = deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || order.amount), 0);
        const revenue = totalDeliveredAmount * 0.05;
        setTotalRevenue(revenue);
        setRecentOrders(ordersData.slice(0, 5)); // Top 5 recent orders

        // Generate Sales Report Data with orders grouped by period
        const generateSalesReport = (type: 'monthly' | 'weekly') => {
          const reportMap = new Map<string, SalesReportEntry>();

          ordersData.forEach(order => {
            if (order.status === 'paid' || order.status === 'delivered') {
              const orderDate = order.createdAt.toDate();
              let periodKey: string;
              let periodStart: Date;
              let periodEnd: Date;

              if (type === 'monthly') {
                periodKey = format(orderDate, 'MMM yyyy');
                periodStart = startOfMonth(orderDate);
                periodEnd = endOfMonth(orderDate);
              } else { // weekly
                const weekNumber = format(orderDate, 'w');
                periodKey = `Week ${weekNumber}, ${format(orderDate, 'yyyy')}`;
                periodStart = startOfWeek(orderDate, { weekStartsOn: 0 });
                periodEnd = endOfWeek(orderDate, { weekStartsOn: 0 });
              }

              const current = reportMap.get(periodKey) || {
                period: periodKey,
                totalSales: 0,
                totalOrders: 0,
                periodStart,
                periodEnd,
                orders: []
              };
              
              current.totalSales += (order.totalAmount || order.amount);
              current.totalOrders += 1;
              current.orders.push(order);
              reportMap.set(periodKey, current);
            }
          });

          // Sort and format for display
          const sortedReport = Array.from(reportMap.values())
            .sort((a, b) => b.periodStart.getTime() - a.periodStart.getTime());
          
          setSalesReportData(sortedReport);
        };

        generateSalesReport(selectedReportType);
      });

      setLoading(false);
      setRefreshing(false);

      return () => {
        unsubscribeProducts();
        unsubscribeUsers();
        unsubscribeOrders();
      };
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedReportType]);

  useEffect(() => {
    const cleanup = fetchData();
    return () => {
      cleanup.then(unsub => unsub && unsub());
    };
  }, [fetchData]);

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
        return "bg-gray-100 text-gray-800 hover:bg-gray-800";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-800";
    }
  };

  const togglePeriodExpansion = (period: string) => {
    const newExpanded = new Set(expandedPeriods);
    if (newExpanded.has(period)) {
      newExpanded.delete(period);
      setDetailedPeriodData(null);
    } else {
      newExpanded.add(period);
      // Find and set the detailed period data
      const periodData = salesReportData.find(entry => entry.period === period);
      if (periodData) {
        setDetailedPeriodData({
          period: periodData.period,
          orders: periodData.orders,
          totalSales: periodData.totalSales,
          totalOrders: periodData.totalOrders
        });
      }
    }
    setExpandedPeriods(newExpanded);
  };

  const handleDownloadReportPdf = () => {
    const doc = new jsPDF();
    const reportTitle = `${selectedReportType === 'monthly' ? 'Monthly' : 'Weekly'} Sales Report`;

    // Add title
    doc.setFontSize(18);
    doc.text(reportTitle, 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 32);

    // Prepare table data
    const tableColumn = ["Period", "Total Sales", "Total Orders"];
    const tableRows = salesReportData.map(entry => [
      entry.period,
      formatCurrency(entry.totalSales),
      entry.totalOrders.toString()
    ]);

    // Add summary
    const totalSales = salesReportData.reduce((sum, entry) => sum + entry.totalSales, 0);
    const totalOrders = salesReportData.reduce((sum, entry) => sum + entry.totalOrders, 0);
    
    // Add autoTable using the imported function
    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      styles: { 
        fontSize: 10, 
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: { 
        fillColor: [22, 163, 74], // Emerald-600
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        halign: 'center'
      },
      alternateRowStyles: { 
        fillColor: [240, 253, 244] // Emerald-50
      },
      margin: { top: 10 },
    });

    // Get the final Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    
    // Add totals
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Sales: ${formatCurrency(totalSales)}`, 14, finalY + 10);
    doc.text(`Total Orders: ${totalOrders}`, 14, finalY + 20);

    // Save the PDF
    doc.save(`${reportTitle.toLowerCase().replace(/\s/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleDownloadDetailedPeriodPdf = (periodData: DetailedPeriodData) => {
    const doc = new jsPDF();
    const reportTitle = `${periodData.period} - Detailed Orders Report`;

    // Add title
    doc.setFontSize(18);
    doc.text(reportTitle, 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 32);
    doc.text(`Total Orders: ${periodData.totalOrders} | Total Sales: ${formatCurrency(periodData.totalSales)}`, 14, 40);

    // Prepare detailed table data
    const tableColumn = ["Order ID", "Buyer", "Date", "Status", "Amount"];
    const tableRows = periodData.orders.map(order => [
      `#${order.tran_id.substring(0, 8)}...`,
      order.buyerInfo?.name || 'N/A',
      order.createdAt ? format(order.createdAt.toDate(), "yyyy-MM-dd") : 'N/A',
      order.status.replace('_', ' ').toUpperCase(),
      formatCurrency(order.totalAmount || order.amount)
    ]);

    // Add autoTable for detailed orders
    autoTable(doc, {
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      styles: { 
        fontSize: 9, 
        cellPadding: 2,
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: { 
        fillColor: [59, 130, 246], // Blue-600
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        halign: 'center',
        fontSize: 8
      },
      alternateRowStyles: { 
        fillColor: [239, 246, 255] // Blue-50
      },
      margin: { top: 10 },
    });

    // Save the PDF
    doc.save(`${periodData.period.toLowerCase().replace(/[^a-z0-9]/g, '-')}-detailed-orders-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Admin! Here's a snapshot of your platform.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {orderCount} total orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              +{newUsersLastMonth} new users last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
            <p className="text-xs text-muted-foreground">
              {allOrders.filter(o => o.status === 'delivered' || o.status === 'paid').length} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/admin/products" className="hover:opacity-80 transition-opacity">
              <div className="text-2xl font-bold">{productCount}</div>
              <p className="text-xs text-muted-foreground">
                View all products
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground">No recent orders to display.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        #{order.tran_id.substring(0, 8)}...
                      </Link>
                    </TableCell>
                    <TableCell>{order.buyerInfo?.name || 'N/A'}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sales Reports</CardTitle>
          <div className="flex gap-2">
            <Select value={selectedReportType} onValueChange={(value: 'monthly' | 'weekly') => setSelectedReportType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Sales</SelectItem>
                <SelectItem value="weekly">Weekly Sales</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleDownloadReportPdf} variant="outline" size="sm" disabled={salesReportData.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {salesReportData.length === 0 ? (
            <p className="text-muted-foreground">No sales data available for this period.</p>
          ) : (
            <>
              <div className="mb-4 flex gap-4">
                <div className="text-sm text-muted-foreground">
                  Total periods: <span className="font-medium">{salesReportData.length}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total sales: <span className="font-medium">
                    {formatCurrency(salesReportData.reduce((sum, entry) => sum + entry.totalSales, 0))}
                  </span>
                </div>
              </div>
              
              {/* Sales Report Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">Total Orders</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesReportData.map((entry) => (
                      <>
                        <TableRow 
                          key={entry.period} 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => togglePeriodExpansion(entry.period)}
                        >
                          <TableCell>
                            {expandedPeriods.has(entry.period) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {entry.period}
                            <div className="text-xs text-muted-foreground">
                              {format(entry.periodStart, 'MMM dd')} - {format(entry.periodEnd, 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(entry.totalSales)}
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.totalOrders}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailedPeriodData({
                                  period: entry.period,
                                  orders: entry.orders,
                                  totalSales: entry.totalSales,
                                  totalOrders: entry.totalOrders
                                });
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Details Row */}
                        {expandedPeriods.has(entry.period) && (
                          <TableRow className="bg-gray-50">
                            <TableCell colSpan={5}>
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold">
                                    {entry.period} - Order Details ({entry.totalOrders} orders)
                                  </h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadDetailedPeriodPdf({
                                      period: entry.period,
                                      orders: entry.orders,
                                      totalSales: entry.totalSales,
                                      totalOrders: entry.totalOrders
                                    })}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Period Report
                                  </Button>
                                </div>
                                
                                {entry.orders.length === 0 ? (
                                  <p className="text-muted-foreground">No orders in this period.</p>
                                ) : (
                                  <div className="border rounded-md overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Order ID</TableHead>
                                          <TableHead>Buyer</TableHead>
                                          <TableHead>Date</TableHead>
                                          <TableHead>Status</TableHead>
                                          <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {entry.orders.map((order) => (
                                          <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                              <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                                                #{order.tran_id.substring(0, 8)}...
                                              </Link>
                                            </TableCell>
                                            <TableCell>{order.buyerInfo?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                              {order.createdAt ? format(order.createdAt.toDate(), "yyyy-MM-dd HH:mm") : 'N/A'}
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
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detailed Period Modal/View */}
      {detailedPeriodData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {detailedPeriodData.period} - Detailed View
              <p className="text-sm font-normal text-muted-foreground">
                {detailedPeriodData.totalOrders} orders • Total: {formatCurrency(detailedPeriodData.totalSales)}
              </p>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailedPeriodData(null)}
              >
                Close
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleDownloadDetailedPeriodPdf(detailedPeriodData)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {detailedPeriodData.orders.length === 0 ? (
              <p className="text-muted-foreground">No orders in this period.</p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedPeriodData.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                            #{order.tran_id}
                          </Link>
                        </TableCell>
                        <TableCell>{order.buyerInfo?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {order.createdAt ? format(order.createdAt.toDate(), "yyyy-MM-dd HH:mm") : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {order.orderType === 'cart_checkout' ? 'Cart' : 'Single Offer'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.totalAmount || order.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}