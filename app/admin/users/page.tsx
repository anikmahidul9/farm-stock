"use client"

import { useState, useEffect, Suspense } from "react"
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
import { Heart, Search, MoreVertical, UserCheck, UserX, Shield, Download, FileText, Calendar } from "lucide-react"
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

// Define User interface
interface User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  type: "Seller" | "Buyer";
  status: "Active" | "Pending" | "Suspended";
  verified: boolean;
  products?: number;
  revenue?: string;
  joined: string;
  joinedTimestamp?: Date;
  isLiked: boolean;
  profileImage?: string;
}

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === 'admin') return;
        
        // Parse joined date
        let joinedDate = new Date();
        let joinedTimestamp = new Date();
        
        if (data.joined) {
          joinedDate = new Date(data.joined);
          joinedTimestamp = joinedDate;
        } else if (data.createdAt) {
          joinedDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          joinedTimestamp = joinedDate;
        }
        
        fetchedUsers.push({
          uid: doc.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "N/A",
          type: data.role === 'seller' ? 'Seller' : 'Buyer',
          status: data.status || "Active",
          verified: data.isVerified || false,
          products: data.products || 0,
          revenue: data.revenue || "$0",
          joined: joinedDate.toISOString().split('T')[0],
          joinedTimestamp: joinedTimestamp,
          isLiked: data.isLiked || false,
          profileImage: data.profileImage || undefined,
        });
      });
      
      setUsers(fetchedUsers);
      applyFilters(fetchedUsers, searchQuery, typeFilter, statusFilter, dateFilter);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters(users, searchQuery, typeFilter, statusFilter, dateFilter);
  }, [searchQuery, typeFilter, statusFilter, dateFilter, users]);

  const applyFilters = (usersList: User[], search: string, type: string, status: string, date: string) => {
    const filtered = usersList.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      const matchesType = type === "all" || user.type === type
      const matchesStatus = status === "all" || user.status === status
      
      // Apply date filter
      const matchesDate = (() => {
        if (date === "all") return true;
        if (!user.joinedTimestamp) return false;
        
        const now = new Date();
        const userDate = user.joinedTimestamp;
        
        switch(date) {
          case "7days":
            const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
            return userDate >= sevenDaysAgo;
          case "30days":
            const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
            return userDate >= thirtyDaysAgo;
          case "month":
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return userDate >= firstDayOfMonth;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
    
    setFilteredUsers(filtered);
  };

  const handleToggleLike = async (userUid: string, currentLikedStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userUid);
      await updateDoc(userRef, {
        isLiked: !currentLikedStatus,
      });
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.uid === userUid ? { ...user, isLiked: !currentLikedStatus } : user
        )
      );
    } catch (err) {
      console.error("Error toggling like status:", err);
    }
  };

  // Generate PDF Report
  const generatePDF = (title: string, usersToExport: User[]) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(`User Management Report - ${title}`, 14, 20);
    
    // Report details
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Total Users: ${usersToExport.length}`, 14, 36);
    
    // Filters applied
    let filtersText = `Filters: `;
    if (typeFilter !== "all") filtersText += `Type: ${typeFilter}, `;
    if (statusFilter !== "all") filtersText += `Status: ${statusFilter}, `;
    if (searchQuery) filtersText += `Search: "${searchQuery}", `;
    if (dateFilter !== "all") filtersText += `Date Range: ${dateFilter}, `;
    
    if (filtersText.length > 10) {
      doc.text(filtersText.slice(0, -2), 14, 42);
    }
    
    // Statistics
    const sellers = usersToExport.filter(u => u.type === "Seller").length;
    const buyers = usersToExport.filter(u => u.type === "Buyer").length;
    const active = usersToExport.filter(u => u.status === "Active").length;
    const pending = usersToExport.filter(u => u.status === "Pending").length;
    const suspended = usersToExport.filter(u => u.status === "Suspended").length;
    const verified = usersToExport.filter(u => u.verified).length;
    
    doc.setFontSize(12);
    doc.text("Statistics:", 14, 52);
    doc.setFontSize(10);
    doc.text(`Sellers: ${sellers}`, 20, 60);
    doc.text(`Buyers: ${buyers}`, 20, 66);
    doc.text(`Active: ${active}`, 20, 72);
    doc.text(`Pending: ${pending}`, 20, 78);
    doc.text(`Suspended: ${suspended}`, 20, 84);
    doc.text(`Verified: ${verified}`, 20, 90);
    
    // Table
    const tableData = usersToExport.map(user => [
      `${user.firstName} ${user.lastName}`,
      user.email,
      user.type,
      user.status,
      user.verified ? "Yes" : "No",
      user.products || 0,
      user.revenue || "$0",
      user.joined,
      user.isLiked ? "Yes" : "No"
    ]);
    
    autoTable(doc, {
      startY: 100,
      head: [['Name', 'Email', 'Type', 'Status', 'Verified', 'Products', 'Revenue', 'Joined', 'Liked']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 100 },
    });
    
    // Save PDF
    doc.save(`user-report-${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`);
  };

  // Handle download for specific time period
  const handleDownloadReport = (period: string) => {
    let filteredByPeriod: User[] = [];
    const now = new Date();
    
    switch(period) {
      case "7days":
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        filteredByPeriod = users.filter(user => 
          user.joinedTimestamp && user.joinedTimestamp >= sevenDaysAgo
        );
        generatePDF("Last 7 Days", filteredByPeriod);
        break;
        
      case "month":
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredByPeriod = users.filter(user => 
          user.joinedTimestamp && user.joinedTimestamp >= firstDayOfMonth
        );
        generatePDF("This Month", filteredByPeriod);
        break;
        
      case "all":
        generatePDF("All Users", filteredUsers);
        break;
    }
  };

  const stats = [
    {
      title: "Total Sellers",
      value: filteredUsers.filter((u) => u.type === "Seller").length,
      pending: filteredUsers.filter((u) => u.type === "Seller" && u.status === "Pending").length,
    },
    {
      title: "Total Buyers",
      value: filteredUsers.filter((u) => u.type === "Buyer").length,
      pending: filteredUsers.filter((u) => u.type === "Buyer" && u.status === "Pending").length,
    },
    {
      title: "Verified Users",
      value: filteredUsers.filter((u) => u.verified).length,
      pending: filteredUsers.filter((u) => !u.verified).length,
    },
    {
      title: "Suspended",
      value: filteredUsers.filter((u) => u.status === "Suspended").length,
      pending: 0,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-muted-foreground ml-2">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

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
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Download Reports Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDownloadReport("7days")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Last 7 Days Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadReport("month")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    This Month's Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadReport("all")}>
                    <FileText className="h-4 w-4 mr-2" />
                    All Filtered Users
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Type Filter */}
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

              {/* Status Filter */}
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
                  <TableHead className="text-center">Liked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}'s profile`} />
                          <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{`${user.firstName} ${user.lastName}`}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
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
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleLike(user.uid, user.isLiked)}
                      >
                        <Heart className={user.isLiked ? "h-4 w-4 fill-red-500 text-red-500" : "h-4 w-4 text-muted-foreground"} />
                      </Button>
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => {
                            const singleUserPDF = new jsPDF();
                            autoTable(singleUserPDF, {
                              head: [['Field', 'Value']],
                              body: [
                                ['Name', `${user.firstName} ${user.lastName}`],
                                ['Email', user.email],
                                ['Type', user.type],
                                ['Status', user.status],
                                ['Verified', user.verified ? 'Yes' : 'No'],
                                ['Products', user.products || 0],
                                ['Revenue', user.revenue || '$0'],
                                ['Joined Date', user.joined],
                                ['Liked', user.isLiked ? 'Yes' : 'No']
                              ],
                              theme: 'grid',
                            });
                            singleUserPDF.save(`user-${user.firstName}-${user.lastName}-${user.uid}.pdf`);
                          }}>
                            <FileText className="h-4 w-4 mr-2" />
                            Download User Report
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