"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { addDoc, collection, getDocs } from "firebase/firestore"

interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export default function AddCategoryPage() {
  const [categoryName, setCategoryName] = useState("")
  const [categoryImage, setCategoryImage] = useState<File | null>(null)
  const [alertThreshold, setAlertThreshold] = useState(10)
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnit, setSelectedUnit] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
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

    fetchUnits()
  }, [])

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

    if (!categoryImage) {
      toast({
        title: "Validation Error",
        description: "Please upload a category image.",
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
      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", categoryImage);
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const { imageUrl } = await response.json();

      // Add category to Firestore
      await addDoc(collection(db, "categories"), {
        name: categoryName,
        imageUrl,
        alertThreshold,
        unit: selectedUnit,
        products: 0,
      });

      toast({
        title: "Success",
        description: `Category "${categoryName}" added successfully!`,
      })
      router.push("/admin/categories")
    } catch (error) {
      console.error("Failed to add category:", error)
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Add New Category</h1>
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
              {!categoryImage && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Upload className="h-4 w-4" /> Upload an image for the category.
                </p>
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
              {isSubmitting ? "Adding Category..." : "Add Category"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
