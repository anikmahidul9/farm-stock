"use client"

import { Badge } from "@/components/ui/badge"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, HelpCircle, Plus, Edit } from "lucide-react"

export default function ContentManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Content</h1>
        <p className="text-muted-foreground mt-1">Manage static pages, legal documents, and FAQs</p>
      </div>

      <Tabs defaultValue="legal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="legal">Legal Documents</TabsTrigger>
          <TabsTrigger value="faq">FAQ Management</TabsTrigger>
          <TabsTrigger value="notifications">System Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="legal">
          <div className="grid gap-4">
            {[
              { title: "Privacy Policy", lastUpdated: "2024-02-15", status: "Published" },
              { title: "Terms of Service", lastUpdated: "2024-02-10", status: "Published" },
              { title: "Seller Agreement", lastUpdated: "2024-03-01", status: "Draft" },
            ].map((doc) => (
              <Card key={doc.title}>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary/60" />
                    <div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription>Last updated: {doc.lastUpdated}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.status === "Published" ? "default" : "secondary"}>{doc.status}</Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit Content
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Help Center Articles</CardTitle>
                <CardDescription>Manage frequently asked questions for buyers and sellers</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> New Question
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "How do I track my order?",
                "What is the seller verification process?",
                "How are delivery charges calculated?",
              ].map((q) => (
                <div key={q} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{q}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
