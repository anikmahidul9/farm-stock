import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SellerSidebar } from "@/components/seller-sidebar"
import { SellerHeader } from "@/components/seller-header"

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <SellerSidebar />
      <SidebarInset>
        <main className="p-4 md:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
