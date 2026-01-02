import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { BuyerSidebar } from "@/components/buyer-sidebar"
import { BuyerHeader } from "@/components/buyer-header"

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <BuyerSidebar />
      <SidebarInset className="bg-orange-50/20">
        <main className="p-4 md:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
