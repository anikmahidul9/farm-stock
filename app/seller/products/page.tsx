"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, increment, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from '@/components/ui/use-toast';

type ProductWithUnit = Product & {
  unitName?: string;
};

export default function SellerProducts() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<ProductWithUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; category: string } | null>(null);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [productToUpdateStock, setProductToUpdateStock] = useState<ProductWithUnit | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [unitMap, setUnitMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchSellerProducts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const unitsSnapshot = await getDocs(collection(db, "units"));
        const uMap = new Map<string, string>();
        unitsSnapshot.docs.forEach(doc => uMap.set(doc.id, doc.data().name));
        setUnitMap(uMap);

        const productsQuery = query(
          collection(db, "products"),
          where("sellerId", "==", user.uid)
        );
        const querySnapshot = await getDocs(productsQuery);
        const productsData = querySnapshot.docs.map(doc => {
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
      } catch (error) {
        console.error("Error fetching seller products: ", error);
        toast({
          title: "Error",
          description: "Failed to load products.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSellerProducts();
    }
  }, [user, authLoading, toast]);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await deleteDoc(doc(db, "products", productToDelete.id));

      // Decrement product count in category
      const categoryRef = doc(db, "categories", productToDelete.category);
      await updateDoc(categoryRef, {
        numberOfProducts: increment(-1),
      });

      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast({
        title: "Product Deleted!",
        description: "The product has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting product: ", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleUpdateStock = async () => {
    if (!productToUpdateStock) return;

    setIsUpdatingStock(true);
    try {
      const productRef = doc(db, "products", productToUpdateStock.id);
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: new Date(), // Update timestamp
      });

      setProducts(products.map(p =>
        p.id === productToUpdateStock.id ? { ...p, stock: newStock, updatedAt: Timestamp.fromDate(new Date()) } : p
      ));
      toast({
        title: "Stock Updated!",
        description: `Stock for ${productToUpdateStock.name} updated to ${newStock}.`,
      });
    } catch (error) {
      console.error("Error updating stock: ", error);
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStock(false);
      setIsStockDialogOpen(false);
      setProductToUpdateStock(null);
      setNewStock(0);
    }
  };

  const getStatusColor = (stock: number) => {
    if (stock === 0) {
      return "bg-destructive/10 text-destructive hover:bg-destructive/10 border-destructive/20";
    } else if (stock <= 50) { // Assuming 50 is the low stock threshold
      return "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200";
    } else {
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200";
    }
  }

  const getStatusText = (stock: number) => {
    if (stock === 0) {
      return "Out of Stock";
    } else if (stock <= 50) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog and listing statuses.</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/seller/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search products..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No products found.</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="h-10 w-10 rounded-lg overflow-hidden border bg-muted">
                      <Image
                        src={product.imageUrls[0] || "/placeholder.svg"}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    Tk{product.price.toLocaleString()} / {product.unitName}
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(product.stock)}>
                      {getStatusText(product.stock)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/seller/products/edit/${product.id}`}>Edit Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setProductToUpdateStock(product);
                            setNewStock(product.stock); // Pre-fill with current stock
                            setIsStockDialogOpen(true);
                          }}
                        >
                          Update Stock
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setProductToDelete({ id: product.id, category: product.category });
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your product
              from our servers and remove its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock for {productToUpdateStock?.name}</DialogTitle>
            <DialogDescription>
              Enter the new stock quantity for this product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                New Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock} disabled={isUpdatingStock}>
              {isUpdatingStock && <Spinner className="mr-2 h-4 w-4" />}
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}