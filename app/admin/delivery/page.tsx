"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, UserPlus, Search, Edit2, ShieldCheck } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const deliveryBoys = [
  { id: 1, name: "Mike Ross", area: "Downtown", status: "Active", orders: 156, rating: 4.8 },
  { id: 2, name: "Sarah Connor", area: "North Side", status: "On Delivery", orders: 89, rating: 4.9 },
  { id: 3, name: "Harvey Specter", area: "Financial District", status: "Offline", orders: 234, rating: 4.7 },
]

function DeliveryContent() {
  const [deliveryCharges, setDeliveryCharges] = useState([
    { id: 1, zone: "Zone A (0-5km)", baseCharge: 20, perKm: 5, active: true },
    { id: 2, zone: "Zone B (5-10km)", baseCharge: 40, perKm: 4, active: true },
    { id: 3, zone: "Zone C (10km+)", baseCharge: 60, perKm: 3, active: true },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
          <p className="text-muted-foreground mt-1">Manage delivery personnel and shipping rate configurations</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Delivery Boy
        </Button>
      </div>

      <Tabs defaultValue="charges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charges">Delivery Charges</TabsTrigger>
          <TabsTrigger value="personnel">Delivery Personnel</TabsTrigger>
          <TabsTrigger value="zones">Coverage Zones</TabsTrigger>
        </TabsList>

        <TabsContent value="charges">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Rate Management</CardTitle>
              <CardDescription>Configure base charges and distance-based fees</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Zone</TableHead>
                    <TableHead>Base Charge</TableHead>
                    <TableHead>Extra Fee (per km)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryCharges.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.zone}</TableCell>
                      <TableCell>${zone.baseCharge}</TableCell>
                      <TableCell>${zone.perKm}</TableCell>
                      <TableCell>
                        <Badge variant={zone.active ? "default" : "secondary"}>
                          {zone.active ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Delivery Staff</CardTitle>
                  <CardDescription>Monitor and manage your delivery fleet</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search personnel..." className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Primary Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders Done</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryBoys.map((boy) => (
                    <TableRow key={boy.id}>
                      <TableCell className="font-medium">{boy.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {boy.area}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            boy.status === "Active" ? "default" : boy.status === "On Delivery" ? "secondary" : "outline"
                          }
                        >
                          {boy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{boy.orders}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-green-600" />
                          {boy.rating}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View History
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function DeliveryManagement() {
  return (
    <Suspense fallback={null}>
      <DeliveryContent />
    </Suspense>
  )
}
