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
import { Search, MoreVertical, Check, X, AlertTriangle, Package } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Organic Tomatoes",
    category: "Vegetables",
    seller: "Green Valley Farms",
    price: "$3.99/kg",
    stock: 250,
    status: "Active",
    sales: 1243,
  },
  {
    id: 2,
    name: "Fresh Apples",
    category: "Fruits",
    seller: "Fresh Harvest Co.",
    price: "$4.50/kg",
    stock: 180,
    status: "Active",
    sales: 1156,
  },
  {
    id: 3,
    name: "Basmati Rice",
    category: "Grains",
    seller: "Organic Fields",
    price: "$12.99/5kg",
    stock: 45,
    status: "Low Stock",
    sales: 987,
  },
  {
    id: 4,
    name: "Fresh Milk",
    category: "Dairy",
    seller: "Nature's Basket",
    price: "$2.99/L",
    stock: 320,
    status: "Active",
    sales: 876,
  },
  {
    id: 5,
    name: "Organic Spinach",
    category: "Vegetables",
    seller: "Farm Fresh Direct",
    price: "$2.50/kg",
    stock: 15,
    status: "Low Stock",
    sales: 754,
  },
  {
    id: 6,
    name: "Sweet Corn",
    category: "Vegetables",
    seller: "Green Valley Farms",
    price: "$1.99/piece",
    stock: 0,
    status: "Pending",
    sales: 0,
  },
]

const categories = ["Vegetables", "Fruits", "Grains", "Dairy", "Meat", "Bakery"]

function ProductsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      subtext: "Across all categories",
    },
    {
      title: "Moderation Queue",
      value: products.filter((p) => p.status === "Pending").length,
      subtext: "Awaiting verification",
    },
    {
      title: "Low Stock",
      value: products.filter((p) => p.status === "Low Stock").length,
      subtext: "Below threshold",
    },
    {
      title: "Categories",
      value: categories.length,
      subtext: "Active categories",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">Inventory & Moderation</h1>
        <p className="text-muted-foreground mt-1">Manage listings and verify new product quality</p>
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
            <CardTitle>All Products</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
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
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="font-medium">{product.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.seller}</TableCell>
                    <TableCell className="font-medium">{product.price}</TableCell>
                    <TableCell className="text-right">
                      <span className={product.stock < 50 ? "text-red-600 font-medium" : "text-foreground"}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "Active"
                            ? "default"
                            : product.status === "Pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {product.status === "Low Stock" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{product.sales}</TableCell>
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
                          {product.status === "Pending" && (
                            <>
                              <DropdownMenuItem className="text-green-600">
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem>View Analytics</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Remove Product</DropdownMenuItem>
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

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  )
}
