"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, ChevronLeft, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from '@/components/ui/use-toast';
import Image from "next/image";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { collection, getDocs, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category, Product } from "@/types";

type Unit = {
  id: string;
  name: string;
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  unit: z.string().min(1, {
    message: "Please select a unit.",
  }),
  age: z.number().min(0, {
    message: "Age must be a positive number.",
  }),
  weight: z.number().min(0, {
    message: "Weight must be a positive number.",
  }),
  location: z.string().min(1, {
    message: "Location cannot be empty.",
  }),
  imageUrls: z.array(z.string()).min(1, {
    message: "Please upload at least one image.",
  }),
  price: z.number().min(0.01, {
    message: "Price must be a positive number.",
  }),
  stock: z.number().min(0, {
    message: "Stock must be a non-negative number.",
  }),
});

export default function EditProduct() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const productId = params.productId as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      unit: "",
      age: 0,
      weight: 0,
      location: "",
      imageUrls: [],
      price: 0,
      stock: 0,
    },
  });

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;

      setProductLoading(true);
      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data() as Product;
          // Pre-fill form with existing product data
          form.reset({
            name: productData.name,
            description: productData.description,
            category: productData.category,
            unit: productData.unit,
            age: productData.age,
            weight: productData.weight,
            location: productData.location,
            imageUrls: productData.imageUrls,
            price: productData.price,
            stock: productData.stock,
          });
          setImagePreviews(productData.imageUrls);
        } else {
          toast({
            title: "Error",
            description: "Product not found.",
            variant: "destructive",
          });
          router.push("/seller/products");
        }
      } catch (error) {
        console.error("Error fetching product data: ", error);
        toast({
          title: "Error",
          description: "Failed to load product data.",
          variant: "destructive",
        });
      } finally {
        setProductLoading(false);
      }
    };

    fetchProductData();
  }, [productId, form, router, toast]);

  useEffect(() => {
    if (!loading && (!user || !userData || !userData.isVerified)) {
      toast({
        title: "Verification Required",
        description: "Please complete your farm verification to manage products.",
        variant: "destructive",
      });
      router.push("/seller/profile");
    }
  }, [user, userData, loading, router, toast]);

  useEffect(() => {
    const fetchCategoriesAndUnits = async () => {
      setDataLoading(true);
      try {
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);

        const unitsSnapshot = await getDocs(collection(db, "units"));
        const unitsData = unitsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        })) as Unit[];
        setUnits(unitsData);

      } catch (error) {
        console.error("Error fetching categories or units: ", error);
        toast({
          title: "Error",
          description: "Failed to load categories or units.",
          variant: "destructive",
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchCategoriesAndUnits();
  }, [toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // 1. Upload new images if any
      const uploadedImageUrls: string[] = [...imagePreviews]; // Start with existing images
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Image upload failed.");
        }
        const data = await response.json();
        uploadedImageUrls.push(data.imageUrl);
      }

      // 2. Update product data in Firestore
      if (!user?.uid) {
        throw new Error("User not authenticated.");
      }

      const productData = {
        ...values,
        imageUrls: uploadedImageUrls,
        updatedAt: serverTimestamp(),
      };

      // Filter out undefined values
      const filteredProductData = Object.fromEntries(
        Object.entries(productData).filter(([, value]) => value !== undefined)
      );

      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, filteredProductData);

      toast({
        title: "Product Updated!",
        description: "Your product has been successfully updated.",
      });
      router.push("/seller/products"); // Redirect to products list
    } catch (error: unknown) {
      console.log("Form values before Firestore:", values);
      let errorMessage = "Failed to update product. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImageFiles((prevFiles) => [...prevFiles, ...files]);

      const newPreviews: string[] = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            const updatedPreviews = [...imagePreviews, ...newPreviews];
            setImagePreviews(updatedPreviews);
            form.setValue("imageUrls", updatedPreviews, { shouldValidate: true });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updatedPreviews);
    form.setValue("imageUrls", updatedPreviews, { shouldValidate: true });
  };

  if (loading || dataLoading || productLoading || !user || !userData || !userData.isVerified) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/products">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update the fundamental details of your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Organic Red Tomatoes" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your product&apos;s display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age of Product (in days)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 30" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                        </FormControl>
                        <FormDescription>
                          Enter the age of the product in days.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (in kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 500" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                        </FormControl>
                        <FormDescription>
                          Enter the weight of the product in kilograms.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Your Farm Location" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the location where the product is available.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your product, its origin, and freshness..." rows={4} {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of your product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>Manage your stock levels and pricing strategy.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Stock</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Upload high-quality images of your product.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div
                    className="aspect-square rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center text-center p-6 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WebP (max. 2MB)</p>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                          <Image src={preview} alt={`Product preview ${index + 1}`} fill className="object-cover" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {imagePreviews.length === 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-square rounded-md bg-muted animate-pulse" />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Product
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
