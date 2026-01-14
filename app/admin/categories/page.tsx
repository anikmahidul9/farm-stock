"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, MoreVertical, Edit, Trash2, Bell } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

interface Category {
  id: string;
  name: string;
  numberOfProducts: number;
  alertThreshold: number;
  imageUrl: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground mt-1">Organize your marketplace hierarchy and set stock alerts</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/categories/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{categories.length}</div>}
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock Alerts Active</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />4
            </div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Main Categories</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search categories..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Alert Threshold</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">{category.numberOfProducts}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-mono">
                        {"<"} {category.alertThreshold} units
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
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/categories/edit/${category.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
