"use client"

import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  Tags,
  Truck,
  Home,
  Wallet,
  UserPlus,
  FileText,
  ShieldCheck,
  Bell,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    name: "Inventory",
    items: [
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: Tags },
      { name: "Stock Alerts", href: "/admin/stock-alerts", icon: Bell },
    ],
  },
  {
    name: "Users",
    items: [
      { name: "All Users", href: "/admin/users", icon: Users },
      { name: "Seller Approvals", href: "/admin/sellers/approvals", icon: ShieldCheck },
      { name: "Referral System", href: "/admin/referrals", icon: UserPlus },
    ],
  },
  {
    name: "Transactions",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Wallets", href: "/admin/wallets", icon: Wallet },
    ],
  },
  {
    name: "Platform",
    items: [
      { name: "Homepage", href: "/admin/homepage", icon: Home },
      { name: "Delivery", href: "/admin/delivery", icon: Truck },
      { name: "Content (FAQ/Legal)", href: "/admin/content", icon: FileText },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="bg-primary text-primary-foreground h-8 w-8 rounded flex items-center justify-center">M</div>
          <span className="group-data-[collapsible=icon]:hidden">MarketAdmin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.name}>
            <SidebarGroupLabel>{section.name}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.href ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === section.href}>
                      <Link href={section.href}>
                        <section.icon className="h-4 w-4" />
                        <span>{section.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  section.items?.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:hidden">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">Admin User</span>
            <span className="text-xs text-muted-foreground">admin@market.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
