"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImagePlus, MoveUp, MoveDown, Trash2, Layout, SlidersHorizontal, Eye } from "lucide-react"

export default function HomepageManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage Management</h1>
          <p className="text-muted-foreground mt-1">Control banners, sliders, and promotional sections</p>
        </div>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Preview Live Site
        </Button>
      </div>

      <Tabs defaultValue="banners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="banners">Banners & Sliders</TabsTrigger>
          <TabsTrigger value="sections">Featured Sections</TabsTrigger>
          <TabsTrigger value="promotions">Active Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="relative overflow-hidden group">
              <div className="aspect-video bg-muted flex items-center justify-center border-b">
                <Layout className="h-12 w-12 text-muted-foreground" />
                <Badge className="absolute top-2 right-2">Active</Badge>
              </div>
              <CardHeader>
                <CardTitle>Main Hero Slider</CardTitle>
                <CardDescription>First thing users see when they visit</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <SlidersHorizontal className="h-4 w-4 mr-1" /> Configure
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center justify-center border-dashed aspect-video">
              <ImagePlus className="h-12 w-12 text-muted-foreground mb-4" />
              <Button variant="outline">Upload New Banner</Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>Section Reordering</CardTitle>
              <CardDescription>Drag and drop to change the layout of the homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {["Flash Sales", "New Arrivals", "Top Sellers", "Recommended for You"].map((section, i) => (
                <div key={section} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground font-mono">0{i + 1}</span>
                    <span className="font-medium">{section}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
