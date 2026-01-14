"use client";

import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { BuyerSidebar } from "@/components/buyer-sidebar";
import { BuyerHeader } from "@/components/buyer-header";
import { useAuth } from "@/components/auth-provider"; // Import useAuth
import { useRouter } from "next/navigation"; // Import useRouter
import { useEffect } from "react"; // Import useEffect
import { Spinner } from "@/components/ui/spinner"; // Assuming a spinner component exists

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth(); // Use the auth hook
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin"); // Redirect to sign-in if not authenticated
    } else if (!loading && user && userData && userData.role !== "buyer") {
      router.push("/"); // Redirect if authenticated but not a buyer
    }
  }, [user, userData, loading, router]);

  if (loading || !user || (user && userData && userData.role !== "buyer")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    ); // Show spinner while loading or redirecting
  }

  return (
    <SidebarProvider>
      <BuyerSidebar />
      <SidebarInset className="bg-orange-50/20">
        <BuyerHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
