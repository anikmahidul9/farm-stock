"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreVertical, UserCheck, UserX, Shield } from "lucide-react"

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    type: "Seller",
    status: "Active",
    verified: true,
    products: 45,
    revenue: "$12,456",
    joined: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    type: "Buyer",
    status: "Active",
    verified: true,
    products: 0,
    revenue: "$0",
    joined: "2024-02-20",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    type: "Seller",
    status: "Pending",
    verified: false,
    products: 23,
    revenue: "$8,234",
    joined: "2024-03-10",
  },
  {
    id: 4,
    name: "Alice Williams",
    email: "alice@example.com",
    type: "Seller",
    status: "Suspended",
    verified: true,
    products: 12,
    revenue: "$3,456",
    joined: "2024-01-05",
  },
  {
    id: 5,
    name: "Charlie Brown",
    email: "charlie@example.com",
    type: "Buyer",
    status: "Active",
    verified: false,
    products: 0,
    revenue: "$0",
    joined: "2024-03-25",
  },
]

function UsersContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || user.type === typeFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = [
    {
      title: "Total Sellers",
      value: users.filter((u) => u.type === "Seller").length,
      pending: users.filter((u) => u.type === "Seller" && u.status === "Pending").length,
    },
    {
      title: "Total Buyers",
      value: users.filter((u) => u.type === "Buyer").length,
      pending: users.filter((u) => u.type === "Buyer" && u.status === "Pending").length,
    },
    {
      title: "Verified Users",
      value: users.filter((u) => u.verified).length,
      pending: users.filter((u) => !u.verified).length,
    },
    {
      title: "Suspended",
      value: users.filter((u) => u.status === "Suspended").length,
      pending: 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage buyers, sellers, and user permissions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.pending > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{stat.pending} pending approval</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Seller">Sellers</SelectItem>
                  <SelectItem value="Buyer">Buyers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "Active" ? "default" : user.status === "Pending" ? "secondary" : "destructive"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.verified ? (
                        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">Unverified</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{user.products}</TableCell>
                    <TableCell className="text-right font-medium">{user.revenue}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.joined}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <UserCheck className="h-4 w-4 mr-2" />
                            {user.status === "Active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            {user.verified ? "Unverify" : "Verify"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <UserX className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersContent />
    </Suspense>
  )
}
