"use client"

import {
  Search,
  ShoppingCart,
  Heart,
  Bell,
  MessageSquare,
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"
import { auth, db } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { NotificationBell } from "@/components/notification-bell"
import { MessageBell } from "@/components/message-bell"

export function Navbar() {
  const { user, userData, loading } = useAuth()
  const { cartCount } = useCart()
  const router = useRouter()
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    if (user) {
      const wishlistRef = collection(db, "users", user.uid, "wishlist")
      const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
        setWishlistCount(snapshot.size)
      })
      return () => unsubscribe()
    } else {
      setWishlistCount(0)
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      // Redirect to home page after logout
      router.push("/")
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }

  const renderUserActions = () => {
    if (loading) {
      return <Skeleton className="h-10 w-24" />
    }

    if (user && userData) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 border-l pl-4 hover:bg-transparent">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">{userData.firstName}</span>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs capitalize">{userData.role}</Badge>
              </div>
              <Avatar className="h-10 w-10 bg-emerald-500">
               <AvatarImage src={userData.profileImageUrl} alt={`${userData.firstName} ${userData.lastName}'s profile`} />
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-700" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() =>{
              if(userData.role === 'seller'){
                router.push('/seller/profile')
            } else if(userData.role === 'buyer'){
                router.push('/buyer/profile')
            } else{
                router.push('/admin/profile')
            }}}>
              <User className="mr-2 h-4 w-4" />
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              let dashboardUrl = '/dashboard';
              if (userData.role === 'admin') {
                dashboardUrl = '/admin';
              } else if (userData.role === 'seller') {
                dashboardUrl = '/seller';
              } else if (userData.role === 'buyer') {
                dashboardUrl = '/buyer';
              }
              router.push(dashboardUrl);
            }}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onSelect={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <Link href="/signin">
          <Button variant="ghost" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-sm font-medium">
            Sign Up
          </Button>
        </Link>
      </div>
    )
  }

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
          {/* <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input type="search" placeholder="Search" className="pl-10 bg-gray-50 border-gray-200" /> */}
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
            <Link href="/marketplace" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Marketplace
              </Link>
            <Link href="/buy-request" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                Buy Requests
          </Link>
          {userData?.role !== 'seller' && (
            <>
            
              <Link href="/cart" className="relative flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-3 -top-2 h-4 w-4 rounded-full bg-red-500 p-0 text-xs flex items-center justify-center text-white">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </>
          )}
        </div>

        {/* Action Icons & User Menu */}
        <div className="flex items-center gap-2">
          {userData?.role !== 'seller' && (
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5 text-gray-700" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs flex items-center justify-center text-white">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
           <MessageBell/>
            <NotificationBell />
          {renderUserActions()}
        </div>
      </div>
    </nav>
  )
}
