"use client"

import { Search, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import { NotificationBell } from "@/components/notification-bell"
import { MessageBell } from "@/components/message-bell"

export function BuyerHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-orange-100 bg-white/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger />
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
      <div className="flex items-center gap-1 md:gap-2">
        <MessageBell />
        <NotificationBell />

        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 border-2 border-white shadow-sm" />
      </div>
    </header>
  )
}
