"use client"
import { LayoutDashboard, Package, ShoppingCart, Wallet, User, LogOut, ChevronRight, Home } from "lucide-react" // Added Home icon
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"; // Import signOut
import { auth } from "@/lib/firebase"; // Import auth instance
import { useAuth } from "@/components/auth-provider"; // Import useAuth hook
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components
import { Badge } from "@/components/ui/badge"; // Import Badge component

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const navigation = [
  // {
  //   title: "Home",
  //   url: "/", // Changed from "/seller" to "/"
  //   icon: Home,
  // },
  {
    title: "Overview",
    url: "/seller",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    url: "/seller/products",
    icon: Package,
    items: [
      { title: "All Products", url: "/seller/products" },
      { title: "Add Product", url: "/seller/products/new" },
      { title: "Stock Management", url: "/seller/stock" },
    ],
  },
  {
    title: "Orders",
    url: "/seller/orders",
    icon: ShoppingCart,
  },
  // {
  //   title: "Earnings",
  //   url: "/seller/earnings",
  //   icon: Wallet,
  // },
  {
    title: "Profile",
    url: "/seller/profile",
    icon: User,
  },
]

export function SellerSidebar() {
  const pathname = usePathname()
  const { userData, loading } = useAuth(); // Get user data from context

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Optionally redirect to login page or home page after logout
      // router.push('/login'); // If you have a router instance
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    // Optionally render a minimal sidebar or null during loading
    return null;
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="bg-emerald-600 text-white h-8 w-8 rounded flex items-center justify-center">S</div>
          <span className="group-data-[collapsible=icon]:hidden">SellerPanel</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible asChild defaultOpen={pathname.startsWith(item.url)} className="group/collapsible">
                      <div className="flex flex-col">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                  <Link href={subItem.url}>{subItem.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        {userData && ( // Only render if userData is available
          <div className="flex items-center gap-2 mb-4"> {/* Added margin-bottom */}
            <Avatar className="h-9 w-9">
              <AvatarImage src={userData.profileImageUrl} alt={`${userData.firstName} ${userData.lastName}'s profile`} />
              <AvatarFallback className="bg-emerald-600 text-white">
                {userData.firstName?.[0]}{userData.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-base">{`${userData.firstName || ''} ${userData.lastName || ''}`}</span>
              <span className="text-xs text-muted-foreground">{userData.email}</span>
              <Badge variant="secondary" className="mt-1 w-fit">{userData.role}</Badge>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
