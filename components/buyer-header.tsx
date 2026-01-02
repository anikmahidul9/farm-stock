"use client"

import { Search, ShoppingCart, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"

export function BuyerHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-orange-100 bg-white/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex flex-1 items-center gap-4 md:gap-8">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
          <Input
            type="search"
            placeholder="Search fresh produce..."
            className="w-full pl-10 bg-orange-50/50 border-orange-100 focus-visible:ring-orange-500 focus-visible:bg-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="relative hover:bg-orange-50 hover:text-orange-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-600 border-2 border-white" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Link href="/buyer/cart">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 bg-transparent"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-orange-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">3</span>
          </Button>
        </Link>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 border-2 border-white shadow-sm" />
      </div>
    </header>
  )
}
