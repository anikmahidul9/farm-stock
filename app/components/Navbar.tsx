"use client"

import {
  Search,
  ShoppingCart,
  Heart,
  Bell,
  MessageSquare,
  ChevronDown,
  User,
  CreditCard,
  MapPin,
  LayoutDashboard,
  MessageCircle,
  Plus,
  Building2,
  Users,
  LogOut,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function Navbar() {
  const isSignedIn = false; // Placeholder for authentication status
  const userName = "Anik"; // Placeholder for user name
  const userRole = "Buyer"; // Placeholder for user role
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-white"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" x2="4" y1="22" y2="15" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900">StockLot</span>
            <span className="text-xs text-emerald-600">Livestock Marketplace</span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input type="search" placeholder="Search" className="pl-10 bg-gray-50 border-gray-200" />
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
           <Link href="/marketplace" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Marketplace
          </Link>
          <Link href="/buy-request" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">
            Buy Requests
          </Link>
          <Link href="/cart" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">
            <ShoppingCart className="h-4 w-4" />
          </Link>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <Link href="wishlist">
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5 text-gray-700" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs flex items-center justify-center text-white">
              3
            </Badge>
          </Button>
          </Link>
        <Link href="/notifications">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-gray-700" />
          </Button>
        </Link>
        <Link href="/messages">
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-5 w-5 text-gray-700" />
          </Button>
          </Link>
        </div>

        {isSignedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 border-l pl-4 hover:bg-transparent">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{userName}</span>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">{userRole}</Badge>
                </div>
                <Avatar className="h-10 w-10 bg-emerald-500">
                  <AvatarFallback className="bg-emerald-500 text-white font-medium">{userName[0]}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Methods
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Wallet className="mr-2 h-4 w-4" />
                Credit Wallet
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MapPin className="mr-2 h-4 w-4" />
                Addresses
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Heart className="mr-2 h-4 w-4" />
                Wishlist
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageCircle className="mr-2 h-4 w-4" />
                Messages
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Requests
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Plus className="mr-2 h-4 w-4" />
                Post Request
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Building2 className="mr-2 h-4 w-4" />
                Create Organization
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                Referrals
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/signin">
            <Button variant="ghost" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
