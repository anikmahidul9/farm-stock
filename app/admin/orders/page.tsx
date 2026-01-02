"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreVertical, Eye, CheckCircle } from "lucide-react"

const orders = [
  {
    id: "ORD-001",
    buyer: "Jane Smith",
    seller: "Green Valley Farms",
    products: 3,
    amount: "$45.97",
    commission: "$2.30",
    status: "Delivered",
    payment: "Paid",
    date: "2024-03-28",
  },
  {
    id: "ORD-002",
    buyer: "Charlie Brown",
    seller: "Fresh Harvest Co.",
    products: 2,
    amount: "$28.50",
    commission: "$1.43",
    status: "Pending",
    payment: "Paid",
    date: "2024-03-28",
  },
  {
    id: "ORD-003",
    buyer: "Jane Smith",
    seller: "Organic Fields",
    products: 5,
    amount: "$67.45",
    commission: "$3.37",
    status: "Processing",
    payment: "Paid",
    date: "2024-03-27",
  },
  {
    id: "ORD-004",
    buyer: "Bob Wilson",
    seller: "Nature's Basket",
    products: 1,
    amount: "$12.99",
    commission: "$0.65",
    status: "Cancelled",
    payment: "Refunded",
    date: "2024-03-27",
  },
  {
    id: "ORD-005",
    buyer: "Alice Johnson",
    seller: "Farm Fresh Direct",
    products: 4,
    amount: "$52.20",
    commission: "$2.61",
    status: "Delivered",
    payment: "Paid",
    date: "2024-03-26",
  },
]

function OrdersContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.seller.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPayment = paymentFilter === "all" || order.payment === paymentFilter
    return matchesSearch && matchesStatus && matchesPayment
  })

  const totalRevenue = orders.reduce((sum, order) => sum + Number.parseFloat(order.amount.slice(1)), 0)
  const totalCommission = orders.reduce((sum, order) => sum + Number.parseFloat(order.commission.slice(1)), 0)

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      subtext: "All time orders",
    },
    {
      title: "Pending Orders",
      value: orders.filter((o) => o.status === "Pending").length,
      subtext: "Awaiting processing",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      subtext: "Gross sales",
    },
    {
      title: "Commission Earned",
      value: `$${totalCommission.toFixed(2)}`,
      subtext: "Platform earnings",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">Order Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage all platform transactions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Orders</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">{order.id}</TableCell>
                    <TableCell>{order.buyer}</TableCell>
                    <TableCell className="text-muted-foreground">{order.seller}</TableCell>
                    <TableCell className="text-right">{order.products}</TableCell>
                    <TableCell className="font-semibold">{order.amount}</TableCell>
                    <TableCell className="font-medium text-primary">{order.commission}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Delivered"
                            ? "default"
                            : order.status === "Cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {order.status === "Delivered" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.payment === "Paid" ? "default" : order.payment === "Refunded" ? "secondary" : "outline"
                        }
                      >
                        {order.payment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{order.date}</TableCell>
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem>Contact Buyer</DropdownMenuItem>
                          <DropdownMenuItem>Contact Seller</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersContent />
    </Suspense>
  )
}
