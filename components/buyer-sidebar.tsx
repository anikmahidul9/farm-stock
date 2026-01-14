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
  Home, // Added Home icon
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
import { usePathname, useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useAuth } from "./auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

const navigation = [
  {
    name: "Orders & Activity",
    items: [
      { name: "My Orders & Offers", href: "/buyer/orders", icon: History },
      { name: "Wishlist", href: "/buyer/wishlist", icon: Heart },
      { name: "My Reviews", href: "/buyer/reviews", icon: Star },
    ],
  },
  {
    name: "Account",
    items: [
      { name: "Profile", href: "/buyer/profile", icon: User },
    ],
  },
]

export function BuyerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { userData } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/signin")
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-orange-100 bg-orange-50/30">
      <SidebarHeader className="border-b border-orange-100 px-6 py-4 bg-white">
        <div className="flex items-center gap-2 font-bold text-xl text-orange-600">
          <div className="bg-orange-600 text-white h-8 w-8 rounded flex items-center justify-center">
            B
          </div>
          <span className="group-data-[collapsible=icon]:hidden">Buyer Panel</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white/50">
        <SidebarMenu>
          {" "}
          {/* Added SidebarMenu here for the Home link */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Home">
              <Link href="/">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild isActive={pathname === "/buyer"} tooltip="Home">
              <Link href="/buyer">
                <Home className="h-4 w-4" />
                <span>Overview</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {navigation.map((section) => (
          <SidebarGroup key={section.name}>
            <SidebarGroupLabel className="text-orange-900/50 font-semibold uppercase tracking-wider text-[10px]">
              {section.name}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
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
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-orange-100 p-4 bg-white space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/buyer/profile" className="w-full">
              <SidebarMenuButton
                className="w-full justify-start items-center gap-2"
                tooltip={`${userData?.firstName} ${userData?.lastName}`}
                isActive={pathname === "/buyer/profile"}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData?.profileImageUrl} alt="User Avatar" />
                  <AvatarFallback>
                    {getInitials(userData?.firstName, userData?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold text-sm">
                    {userData?.firstName} {userData?.lastName}
                  </span>
                  <span className="text-xs text-gray-500">{userData?.email}</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-destructive hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
