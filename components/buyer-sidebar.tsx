"use client"

import {
  LayoutDashboard,
  Search,
  ShoppingCart,
  Heart,
  History,
  Star,
  User,
  Settings,
  LogOut,
  Store,
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
  { name: "Home", href: "/buyer", icon: LayoutDashboard },
  { name: "Browse Products", href: "/buyer/browse", icon: Search },
  { name: "My Cart", href: "/buyer/cart", icon: ShoppingCart },
  {
    name: "Orders & Activity",
    items: [
      { name: "Order History", href: "/buyer/orders", icon: History },
      { name: "Wishlist", href: "/buyer/wishlist", icon: Heart },
      { name: "Saved Sellers", href: "/buyer/sellers", icon: Store },
      { name: "My Reviews", href: "/buyer/reviews", icon: Star },
    ],
  },
  {
    name: "Account",
    items: [
      { name: "Profile", href: "/buyer/profile", icon: User },
      { name: "Settings", href: "/buyer/settings", icon: Settings },
    ],
  },
]

export function BuyerSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-orange-100 bg-orange-50/30">
      <SidebarHeader className="border-b border-orange-100 px-6 py-4 bg-white">
        <div className="flex items-center gap-2 font-bold text-xl text-orange-600">
          <div className="bg-orange-600 text-white h-8 w-8 rounded flex items-center justify-center">B</div>
          <span className="group-data-[collapsible=icon]:hidden">FreshMarket</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white/50">
        {navigation.map((section) => (
          <SidebarGroup key={section.name}>
            <SidebarGroupLabel className="text-orange-900/50 font-semibold uppercase tracking-wider text-[10px]">
              {section.name}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.href ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === section.href}
                      className="hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100"
                    >
                      <Link href={section.href}>
                        <section.icon className="h-4 w-4" />
                        <span>{section.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  section.items?.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        className="hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100"
                      >
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
      <SidebarFooter className="border-t border-orange-100 p-4 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-destructive hover:bg-red-50 hover:text-red-700">
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
