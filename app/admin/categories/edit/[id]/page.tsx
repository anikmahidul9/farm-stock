"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

interface Unit {
  id: string;
  name: string;
  symbol: string;
}

interface Category {
  name: string;
  imageUrl: string;
  alertThreshold: number;
  unit: string;
}

export default function EditCategoryPage() {
  const [category, setCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [categoryImage, setCategoryImage] = useState<File | null>(null)
  const [alertThreshold, setAlertThreshold] = useState(10)
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnit, setSelectedUnit] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const { toast } = useToast()

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "units"));
        const unitsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
        setUnits(unitsData);
      } catch (error) {
        console.error("Error fetching units: ", error);
      }
    }

    const fetchCategory = async () => {
      if (id) {
        setLoading(true)
        try {
          const docRef = doc(db, "categories", id as string);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const categoryData = docSnap.data() as Category
            setCategory(categoryData)
            setCategoryName(categoryData.name)
            setAlertThreshold(categoryData.alertThreshold)
            setSelectedUnit(categoryData.unit)
          }
        } catch (error) {
          console.error("Error fetching category:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUnits()
    fetchCategory()
  }, [id])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCategoryImage(event.target.files[0])
    } else {
      setCategoryImage(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    if (!categoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name cannot be empty.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!selectedUnit) {
      toast({
        title: "Validation Error",
        description: "Please select a unit.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      let imageUrl = category?.imageUrl

      if (categoryImage) {
        const formData = new FormData();
        formData.append("file", categoryImage);
        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        const { secure_url } = await response.json();
        imageUrl = secure_url
      }

      const docRef = doc(db, "categories", id as string);
      await updateDoc(docRef, {
        name: categoryName,
        imageUrl,
        alertThreshold,
        unit: selectedUnit,
      });

      toast({
        title: "Success",
        description: `Category "${categoryName}" updated successfully!`,
      })
      router.push("/admin/categories")
    } catch (error) {
      console.error("Failed to update category:", error)
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Vegetables, Fruits"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Select onValueChange={setSelectedUnit} value={selectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.symbol}>{unit.name} ({unit.symbol})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoryImage">Category Image</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="categoryImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-grow"
                  disabled={isSubmitting}
                />
                {categoryImage && (
                  <span className="text-sm text-muted-foreground">{categoryImage.name}</span>
                )}
              </div>
              {!categoryImage && category?.imageUrl && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <img src={category.imageUrl} alt={category.name} className="h-10 w-10 rounded-full" />
                  <span>Current Image</span>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="alertThreshold">Stock Alert Threshold</Label>
              <Input
                id="alertThreshold"
                type="number"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                disabled={isSubmitting}
                placeholder="e.g., 10"
              />
              <p className="text-sm text-muted-foreground">
                Get notified when stock for products in this category falls below this number.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating Category..." : "Update Category"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
