"use client"

import { useState, useEffect, Suspense } from "react"
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
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product as ProductType, Category } from "@/types";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

type ProductWithUnit = ProductType & {
  unitName?: string;
};

function ProductsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [products, setProducts] = useState<ProductWithUnit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitMap, setUnitMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch units
        const unitsSnapshot = await getDocs(collection(db, "units"));
        const uMap = new Map<string, string>();
        unitsSnapshot.docs.forEach(doc => uMap.set(doc.id, doc.data().name));
        setUnitMap(uMap);

        // Fetch products
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsData = productsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            unitName: uMap.get(data.unit) || "N/A",
          } as ProductWithUnit;
        });
        setProducts(productsData);

        // Fetch categories for filter
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          icon: doc.data().icon,
          count: doc.data().count,
          color: doc.data().color,
          imageURL: doc.data().imageUrl,
          numberOfProducts: doc.data().products,
          alertThreshold: doc.data().alertThreshold,
          unit: doc.data().unit,
        })) as Category[];
        setCategories(categoriesData);

      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    // Note: Product status is not directly stored in the Product type,
    // so we'll need to define how "status" is determined for filtering.
    // For now, let's assume a simple check for stock.
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "Active" && product.stock > 0) ||
      (statusFilter === "Low Stock" && product.stock > 0 && product.stock <= 50) || // Example threshold
      (statusFilter === "Out of Stock" && product.stock === 0); // Added "Out of Stock" for better filtering
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      subtext: "Across all categories",
    },
    {
      title: "Out of Stock",
      value: products.filter((p) => p.stock === 0).length,
      subtext: "Products with no stock",
    },
    {
      title: "Low Stock",
      value: products.filter((p) => p.stock > 0 && p.stock <= 50).length, // Example threshold
      subtext: "Below threshold",
    },
    {
      title: "Categories",
      value: categories.length,
      subtext: "Active categories",
    },
  ]

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">Product Management</h1>
        <p className="text-muted-foreground mt-1">Manage all products listed on the platform.</p>
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
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
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
                  <SelectItem value="Active">Active (In Stock)</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
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
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">No products found.</TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <Image
                            src={product.imageUrls[0]}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{categories.find(cat => cat.id === product.category)?.name || "N/A"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{product.sellerName}</TableCell>
                      <TableCell className="font-medium">
                        Tk{product.price.toLocaleString()} / {product.unitName}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={product.stock <= 50 && product.stock > 0 ? "text-orange-600 font-medium" : product.stock === 0 ? "text-red-600 font-medium" : "text-foreground"}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.stock > 50
                              ? "default"
                              : product.stock > 0 && product.stock <= 50
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {product.stock === 0 && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {product.stock > 50 ? "Active" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
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
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Remove Product</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
