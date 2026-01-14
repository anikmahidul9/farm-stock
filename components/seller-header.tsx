"use client"

import { Search, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import { NotificationBell } from "./notification-bell"
import { MessageBell } from "./message-bell"

export function SellerHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-emerald-100 bg-white/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger />
      <div className="flex flex-1 items-center gap-4 md:gap-8">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pl-10 bg-emerald-50/50 border-emerald-100 focus-visible:ring-emerald-500 focus-visible:bg-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        <MessageBell />
        <NotificationBell />
        <Link href="/seller/profile">
          <Button variant="ghost" size="icon" className="hover:bg-emerald-50 hover:text-emerald-600">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </Link>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 border-2 border-white shadow-sm" />
      </div>
    </header>
  )
}
