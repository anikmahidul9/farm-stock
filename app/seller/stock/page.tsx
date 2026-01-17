"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Save } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Product } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/ui/spinner"

type ProductWithUnit = Product & {
  unitName?: string;
};

export default function StockManagement() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
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

  const handleStockInputChange = (productId: string, value: string) => {
    setStockUpdates(prev => ({ ...prev, [productId]: Number(value) }));
  };

  const handleUpdateStock = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updateValue = stockUpdates[productId] || 0;
    if (updateValue === 0) {
      toast({
        title: "No Change",
        description: "Please enter a value to add or remove stock.",
      });
      return;
    }

    const newStock = product.stock + updateValue;
    if (newStock < 0) {
      toast({
        title: "Invalid Stock",
        description: "Stock cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: new Date(),
      });

      setProducts(products.map(p =>
        p.id === productId ? { ...p, stock: newStock, updatedAt: Timestamp.fromDate(new Date()) } : p
      ));
      setStockUpdates(prev => ({ ...prev, [productId]: 0 }));
      toast({
        title: "Stock Updated!",
        description: `Stock for ${product.name} updated to ${newStock}.`,
      });
    } catch (error) {
      console.error("Error updating stock: ", error);
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
        <p className="text-muted-foreground">Quickly update your inventory levels and view stock history.</p>
      </div>

      <div className="grid gap-4">
        {products.map((item) => (
          <Card key={item.id} className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6">
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                    <History className="h-3 w-3" />
                    Last updated {item.updatedAt.toDate().toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 sm:px-8 border-x sm:border-muted-foreground/10">
                  <span className="text-sm font-medium text-muted-foreground">Current Stock</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{item.stock}</span>
                    <span className="text-sm font-medium text-muted-foreground">{item.unitName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex-1 sm:w-32">
                    <Input
                      type="number"
                      placeholder="Add/Remove"
                      className="text-center"
                      value={stockUpdates[item.id] || ""}
                      onChange={(e) => handleStockInputChange(item.id, e.target.value)}
                    />
                  </div>
                  <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStock(item.id)}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
