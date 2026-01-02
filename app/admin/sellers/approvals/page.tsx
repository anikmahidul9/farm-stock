"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, Eye, FileText, Building2 } from "lucide-react"

const pendingSellers = [
  { id: 1, name: "Gourmet Garden", owner: "Robert Chen", document: "Trade License", date: "2024-03-29" },
  { id: 2, name: "Urban Harvest", owner: "Sarah Miller", document: "ID Proof", date: "2024-03-29" },
  { id: 3, name: "Traditional Grains", owner: "Amit Kumar", document: "FSSAI Cert", date: "2024-03-28" },
]

export default function SellerApprovals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">Seller Onboarding Approvals</h1>
        <p className="text-muted-foreground mt-1">Review business documents and approve new marketplace partners</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
          <CardDescription>Verify these sellers to allow them to list products</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Primary Document</TableHead>
                <TableHead>Application Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingSellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {seller.name}
                    </div>
                  </TableCell>
                  <TableCell>{seller.owner}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <FileText className="h-3 w-3" />
                      {seller.document}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{seller.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
