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
  ChevronUp, ChevronDown, Users, CreditCard, Clock, Box
} from "lucide-react";
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, eachDayOfInterval, eachMonthOfInterval, isWithinInterval, parseISO } from "date-fns";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Order Interface
interface Order {
  id: string;
  amount: number;
  buyRequestId: string;
  buyerId: string;
  buyerInfo: {
    email: string;
    name: string;
  };
  createdAt: Timestamp | Date;
  currency: string;
  offerId: string;
  offerInfo: {
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
  sellerId: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
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
      let q;
      if (userData?.role === "seller") {
        q = query(collection(db, "orders"), where("sellerId", "==", user.uid));
      } else if (userData?.role === "buyer") {
        q = query(collection(db, "orders"), where("buyerId", "==", user.uid));
      } else {
        q = query(collection(db, "orders"));
      }

      const querySnapshot = await getDocs(q);
      const ordersData: Order[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ordersData.push({
          id: doc.id,
          amount: data.amount || 0,
          buyRequestId: data.buyRequestId || "",
          buyerId: data.buyerId || "",
          buyerInfo: data.buyerInfo || { email: "", name: "" },
          createdAt: data.createdAt || new Date(),
          currency: data.currency || "BDT",
          offerId: data.offerId || "",
          offerInfo: data.offerInfo || {
            buyRequestId: "",
            buyRequestTitle: "",
            buyerId: "",
            createdAt: new Date(),
            id: "",
            message: "",
            price: 0,
            sellerId: "",
            sellerName: "",
            status: ""
          },
          sellerId: data.sellerId || "",
          status: data.status || "pending",
          tran_id: data.tran_id || "",
          paymentStatus: data.paymentStatus || "pending",
          deliveryAddress: data.deliveryAddress || "",
          trackingNumber: data.trackingNumber || "",
          estimatedDelivery: data.estimatedDelivery || null
        });
      });

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
            revenue: dayOrders.reduce((sum, order) => sum + order.amount, 0)
          };
        });

        // Generate top products
        const productMap = new Map<string, { orders: number; revenue: number }>();
        filteredOrders.forEach(order => {
          const productName = order.offerInfo.buyRequestTitle;
          const current = productMap.get(productName) || { orders: 0, revenue: 0 };
          productMap.set(productName, {
            orders: current.orders + 1,
            revenue: current.revenue + order.amount
          });
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
            revenue: current.revenue + order.amount
          });
        });

        const topBuyers: TopBuyer[] = Array.from(buyerMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setReportData({
          period: periodLabel,
          totalOrders: filteredOrders.length,
          totalRevenue: filteredOrders.reduce((sum, order) => sum + order.amount, 0),
          avgOrderValue: filteredOrders.length > 0 ? 
            filteredOrders.reduce((sum, order) => sum + order.amount, 0) / filteredOrders.length : 0,
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
            revenue: monthOrders.reduce((sum, order) => sum + order.amount, 0)
          };
        });

        // Generate top products
        const productMap = new Map<string, { orders: number; revenue: number }>();
        filteredOrders.forEach(order => {
          const productName = order.offerInfo.buyRequestTitle;
          const current = productMap.get(productName) || { orders: 0, revenue: 0 };
          productMap.set(productName, {
            orders: current.orders + 1,
            revenue: current.revenue + order.amount
          });
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
            revenue: current.revenue + order.amount
          });
        });

        const topBuyers: TopBuyer[] = Array.from(buyerMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setReportData({
          period: periodLabel,
          totalOrders: filteredOrders.length,
          totalRevenue: filteredOrders.reduce((sum, order) => sum + order.amount, 0),
          avgOrderValue: filteredOrders.length > 0 ? 
            filteredOrders.reduce((sum, order) => sum + order.amount, 0) / filteredOrders.length : 0,
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

  // Generate PDF Report
  const generatePDFReport = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("Sales Report", 105, 20, { align: "center" });
    
    // Period and Details
    doc.setFontSize(10);
    doc.text(`Period: ${reportData.period}`, 14, 35);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 14, 42);
    doc.text(`Report Type: ${reportPeriod === 'week' ? 'Weekly' : 'Monthly'} Analysis`, 14, 49);
    doc.text(`Report For: ${userData?.firstName || ''} ${userData?.lastName || ''}`, 14, 56);
    
    // Summary Statistics
    doc.setFontSize(14);
    doc.text("Summary Statistics", 14, 72);
    
    doc.setFontSize(10);
    const summaryData = [
      ["Metric", "Value"],
      ["Total Orders", reportData.totalOrders.toString()],
      ["Total Sell", `BDT ${reportData.totalRevenue.toLocaleString()}`],
      ["Average Order Value", `BDT ${reportData.avgOrderValue.toFixed(2)}`],
      ["Delivered Orders", reportData.deliveredOrders.toString()],
      ["Cancelled Orders", reportData.cancelledOrders.toString()],
      ["Success Rate", `${((reportData.deliveredOrders / reportData.totalOrders) * 100 || 0).toFixed(1)}%`]
    ];
    
    autoTable(doc, {
      startY: 77,
      head: summaryData.slice(0, 1),
      body: summaryData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 77 },
    });
    
    // Order Status Breakdown
    const statusY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Order Status Breakdown", 14, statusY);
    
    const statusData = Object.entries(reportData.orderStatusBreakdown).map(([status, count]) => [
      status.charAt(0).toUpperCase() + status.slice(1),
      count.toString(),
      `${((count / reportData.totalOrders) * 100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: statusY + 5,
      head: [['Status', 'Count', 'Percentage']],
      body: statusData,
      theme: 'grid',
      headStyles: { fillColor: [51, 102, 153] },
    });
    
    // Time-based Data
    const timeY = (doc as any).lastAutoTable.finalY + 10;
    
    if (reportPeriod === "week" && reportData.dailyData) {
      doc.setFontSize(14);
      doc.text("Daily Performance", 14, timeY);
      
      const dailyTableData = reportData.dailyData.map(day => [
        day.date,
        day.orders.toString(),
        `BDT ${day.revenue.toLocaleString()}`,
        `BDT ${day.orders > 0 ? (day.revenue / day.orders).toFixed(2) : 0}`
      ]);
      
      autoTable(doc, {
        startY: timeY + 5,
        head: [['Date', 'Orders', 'Revenue', 'Avg/Order']],
        body: dailyTableData,
        theme: 'grid',
        headStyles: { fillColor: [102, 153, 51] },
      });
      
    } else if (reportPeriod === "month" && reportData.monthlyData) {
      doc.setFontSize(14);
      doc.text("6-Month Trend Analysis", 14, timeY);
      
      const monthlyTableData = reportData.monthlyData.map(month => [
        month.month,
        month.orders.toString(),
        `BDT ${month.revenue.toLocaleString()}`,
        `BDT ${month.orders > 0 ? (month.revenue / month.orders).toFixed(2) : 0}`
      ]);
      
      autoTable(doc, {
        startY: timeY + 5,
        head: [['Month', 'Orders', 'Revenue', 'Avg/Order']],
        body: monthlyTableData,
        theme: 'grid',
        headStyles: { fillColor: [153, 51, 102] },
      });
    }
    
    // Top Products
    const productsY = (doc as any).lastAutoTable.finalY + 10;
    if (reportData.topProducts && reportData.topProducts.length > 0) {
      doc.setFontSize(14);
      doc.text("Top Products", 14, productsY);
      
      const productsTableData = reportData.topProducts.map((product, index) => [
        (index + 1).toString(),
        product.name.length > 30 ? product.name.substring(0, 30) + "..." : product.name,
        product.orders.toString(),
        `BDT ${product.revenue.toLocaleString()}`,
        `BDT ${product.orders > 0 ? (product.revenue / product.orders).toFixed(2) : 0}`
      ]);
      
      autoTable(doc, {
        startY: productsY + 5,
        head: [['#', 'Product', 'Orders', 'Revenue', 'Avg/Order']],
        body: productsTableData,
        theme: 'grid',
        headStyles: { fillColor: [255, 153, 0] },
      });
    }
    
    // Top Buyers
    const buyersY = (doc as any).lastAutoTable.finalY + 10;
    if (reportData.topBuyers && reportData.topBuyers.length > 0) {
      doc.setFontSize(14);
      doc.text("Top Buyers", 14, buyersY);
      
      const buyersTableData = reportData.topBuyers.map((buyer, index) => [
        (index + 1).toString(),
        buyer.name,
        buyer.orders.toString(),
        `BDT ${buyer.revenue.toLocaleString()}`,
        `BDT ${buyer.orders > 0 ? (buyer.revenue / buyer.orders).toFixed(2) : 0}`
      ]);
      
      autoTable(doc, {
        startY: buyersY + 5,
        head: [['#', 'Customer', 'Orders', 'Revenue', 'Avg/Order']],
        body: buyersTableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 153, 153] },
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.text("Confidential - For internal use only", 105, 285, { align: "center" });
    
    // Save PDF
    const fileName = `${reportPeriod === 'week' ? 'weekly' : 'monthly'}-sales-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };

  // Generate Excel Report
  const generateExcelReport = () => {
    if (!reportData) return;

    const workbook = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ["Sales Report Summary"],
      ["Period", reportData.period],
      ["Generated", format(new Date(), 'dd MMM yyyy, HH:mm')],
      ["Report Type", reportPeriod === 'week' ? 'Weekly' : 'Monthly'],
      ["Generated By", `${userData?.firstName || ''} ${userData?.lastName || ''}`],
      [],
      ["Summary Statistics", ""],
      ["Total Orders", reportData.totalOrders],
      ["Total Revenue", reportData.totalRevenue],
      ["Average Order Value", reportData.avgOrderValue],
      ["Delivered Orders", reportData.deliveredOrders],
      ["Cancelled Orders", reportData.cancelledOrders],
      ["Success Rate", `${((reportData.deliveredOrders / reportData.totalOrders) * 100 || 0).toFixed(1)}%`],
      [],
      ["Order Status Breakdown", "", ""],
      ["Status", "Count", "Percentage"]
    ];

    Object.entries(reportData.orderStatusBreakdown).forEach(([status, count]) => {
      summaryData.push([
        status.charAt(0).toUpperCase() + status.slice(1),
        count,
        `${((count / reportData.totalOrders) * 100).toFixed(1)}%`
      ]);
    });

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Time-based Data Sheet
    if (reportPeriod === "week" && reportData.dailyData) {
      const dailyData = [
        ["Daily Performance"],
        ["Date", "Orders", "Revenue", "Average per Order"],
        ...reportData.dailyData.map(day => [
          day.date, 
          day.orders, 
          day.revenue,
          day.orders > 0 ? (day.revenue / day.orders).toFixed(2) : 0
        ])
      ];
      const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);
      XLSX.utils.book_append_sheet(workbook, dailySheet, "Daily Performance");
    } else if (reportPeriod === "month" && reportData.monthlyData) {
      const monthlyData = [
        ["6-Month Trend Analysis"],
        ["Month", "Orders", "Revenue", "Average per Order"],
        ...reportData.monthlyData.map(month => [
          month.month, 
          month.orders, 
          month.revenue,
          month.orders > 0 ? (month.revenue / month.orders).toFixed(2) : 0
        ])
      ];
      const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(workbook, monthlySheet, "Monthly Trend");
    }

    // Top Products Sheet
    if (reportData.topProducts && reportData.topProducts.length > 0) {
      const productsData = [
        ["Top Products"],
        ["Rank", "Product Name", "Orders", "Revenue", "Average per Order"],
        ...reportData.topProducts.map((product, index) => [
          index + 1,
          product.name,
          product.orders,
          product.revenue,
          product.orders > 0 ? (product.revenue / product.orders).toFixed(2) : 0
        ])
      ];
      const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
      XLSX.utils.book_append_sheet(workbook, productsSheet, "Top Products");
    }

    // Top Buyers Sheet
    if (reportData.topBuyers && reportData.topBuyers.length > 0) {
      const buyersData = [
        ["Top Buyers"],
        ["Rank", "Customer Name", "Email", "Orders", "Revenue", "Average per Order"],
        ...reportData.topBuyers.map((buyer, index) => [
          index + 1,
          buyer.name,
          buyer.email,
          buyer.orders,
          buyer.revenue,
          buyer.orders > 0 ? (buyer.revenue / buyer.orders).toFixed(2) : 0
        ])
      ];
      const buyersSheet = XLSX.utils.aoa_to_sheet(buyersData);
      XLSX.utils.book_append_sheet(workbook, buyersSheet, "Top Buyers");
    }

    // Order Details Sheet
    const now = new Date();
    let startDate: Date, endDate: Date;
    
    if (reportPeriod === "week") {
      startDate = startOfWeek(now, { weekStartsOn: 0 });
      endDate = endOfWeek(now, { weekStartsOn: 0 });
    } else {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }

    const filteredOrders = orders.filter(order => {
      const orderDate = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const orderData = [
      ["Order Details"],
      ["Order ID", "Date", "Customer", "Product", "Amount", "Status", "Payment Status", "Transaction ID"],
      ...filteredOrders.map(order => [
        order.tran_id,
        formatDate(order.createdAt),
        order.buyerInfo.name,
        order.offerInfo.buyRequestTitle,
        order.amount,
        order.status,
        order.paymentStatus || "pending",
        order.tran_id
      ])
    ];

    const orderSheet = XLSX.utils.aoa_to_sheet(orderData);
    XLSX.utils.book_append_sheet(workbook, orderSheet, "Order Details");

    // Save Excel file
    const fileName = `${reportPeriod === 'week' ? 'weekly' : 'monthly'}-sales-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
      case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "processing": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "shipped": return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "delivered": return "bg-green-100 text-green-800 hover:bg-green-100";
      case "cancelled": return "bg-red-100 text-red-800 hover:bg-red-100";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-3 w-3" />;
      case "processing": return <Package className="h-3 w-3" />;
      case "shipped": return <Truck className="h-3 w-3" />;
      case "delivered": return <CheckCircle className="h-3 w-3" />;
      case "cancelled": return <XCircle className="h-3 w-3" />;
      default: return <Package className="h-3 w-3" />;
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
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    totalRevenue: orders.reduce((sum, o) => sum + o.amount, 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.amount, 0) / orders.length : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">Manage and track all orders from buyers</p>
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
                <p className="text-xs text-muted-foreground mt-1">All time orders</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sell</CardTitle>
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
                <CardTitle>All Orders ({orders.length})</CardTitle>
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
                        <TableHead>Product</TableHead>
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
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
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
                            <div className="max-w-[200px] truncate" title={order.offerInfo.buyRequestTitle}>
                              {order.offerInfo.buyRequestTitle}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">BDT {order.amount.toLocaleString()}</span>
                            </div>
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
                              <span className="capitalize">{order.status}</span>
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
                                      ['Product', order.offerInfo.buyRequestTitle],
                                      ['Amount', `BDT ${order.amount}`],
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
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrder(order);
                                  setUpdateStatus(order.status);
                                  setUpdateTracking(order.trackingNumber || "");
                                  setUpdateDialogOpen(true);
                                }}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Update Status
                                </DropdownMenuItem>
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

        {/* Reports Tab */}
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
                      onClick={generatePDFReport} 
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
                      onClick={generateExcelReport} 
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
                  {/* Report Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Period
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold text-blue-900">{reportData.period}</div>
                        <p className="text-xs text-blue-600 mt-1">
                          {reportPeriod === 'week' ? 'This week' : 'This month'}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          Total Orders
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">{reportData.totalOrders}</div>
                        <p className="text-xs text-emerald-600 mt-1">
                          {reportData.deliveredOrders} delivered • {reportData.cancelledOrders} cancelled
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Total Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-amber-900">
                          BDT {reportData.totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-amber-600 mt-1">
                          Avg: BDT {reportData.avgOrderValue.toFixed(2)} per order
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Success Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-900">
                          {((reportData.deliveredOrders / reportData.totalOrders) * 100 || 0).toFixed(1)}%
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Delivery success rate
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Detailed Analytics */}
                  <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="insights">Insights</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Order Status Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(reportData.orderStatusBreakdown).map(([status, count]) => (
                              <div key={status} className="text-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getStatusColor(status)}`}>
                                  <span className="font-bold">{count}</span>
                                </div>
                                <div className="text-sm font-medium capitalize">{status}</div>
                                <div className="text-xs text-muted-foreground">
                                  {((count / reportData.totalOrders) * 100).toFixed(1)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="performance" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            {reportPeriod === 'week' ? 'Daily Performance' : '6-Month Trend'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {reportPeriod === 'week' && reportData.dailyData ? (
                              reportData.dailyData.map((day) => (
                                <div key={day.date} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                  <div>
                                    <div className="font-medium">{day.date}</div>
                                    <div className="text-sm text-muted-foreground">{day.orders} orders</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-emerald-600">
                                      BDT {day.revenue.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Avg: BDT {day.orders > 0 ? (day.revenue / day.orders).toFixed(2) : 0}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : reportPeriod === 'month' && reportData.monthlyData ? (
                              reportData.monthlyData.map((month) => (
                                <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                  <div>
                                    <div className="font-medium">{month.month}</div>
                                    <div className="text-sm text-muted-foreground">{month.orders} orders</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-emerald-600">
                                      BDT {month.revenue.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Avg: BDT {month.orders > 0 ? (month.revenue / month.orders).toFixed(2) : 0}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="insights" className="space-y-4">
                      {/* Top Products */}
                      {reportData.topProducts && reportData.topProducts.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Box className="h-5 w-5" />
                              Top Products
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {reportData.topProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <div className="font-medium">{product.name}</div>
                                      <div className="text-sm text-muted-foreground">{product.orders} orders</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold">BDT {product.revenue.toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Avg: BDT {product.orders > 0 ? (product.revenue / product.orders).toFixed(2) : 0}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {/* Top Buyers */}
                      {reportData.topBuyers && reportData.topBuyers.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Users className="h-5 w-5" />
                              Top Buyers
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {reportData.topBuyers.map((buyer, index) => (
                                <div key={buyer.email} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <div className="font-medium">{buyer.name}</div>
                                      <div className="text-sm text-muted-foreground">{buyer.email}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold">BDT {buyer.revenue.toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">{buyer.orders} orders</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
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
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1 w-fit`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status}</span>
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">BDT {selectedOrder.amount.toLocaleString()}</p>
                </div>
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
                      <div>
                        <p className="text-sm text-muted-foreground">Buyer ID</p>
                        <p className="font-medium text-sm font-mono">{selectedOrder.buyerId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Product Information */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Product Information</Label>
                <Card>
                  <CardContent className="pt-4">
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
                        <p className="text-sm text-muted-foreground">Buy Request ID</p>
                        <p className="font-medium text-sm font-mono">{selectedOrder.buyRequestId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Offer ID</p>
                        <p className="font-medium text-sm font-mono">{selectedOrder.offerId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Currency</p>
                        <p className="font-medium">{selectedOrder.currency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Status</p>
                        <Badge variant={selectedOrder.paymentStatus === "paid" ? "default" : "secondary"}>
                          {selectedOrder.paymentStatus || "pending"}
                        </Badge>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Tracking Number</p>
                            <p className="font-medium">{selectedOrder.trackingNumber}</p>
                          </div>
                        </>
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
                      ['Product', selectedOrder.offerInfo.buyRequestTitle],
                      ['Amount', `BDT ${selectedOrder.amount}`],
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
                <Button onClick={() => {
                  setUpdateDialogOpen(true);
                  setViewDialogOpen(false);
                }} className="flex-1 gap-2">
                  <FileText className="h-4 w-4" />
                  Update Status
                </Button>
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