"use client";

import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SellerSidebar } from "@/components/seller-sidebar";
import { SellerHeader } from "@/components/seller-header";
import { useAuth } from "@/components/auth-provider"; // Import useAuth
import { useRouter } from "next/navigation"; // Import useRouter
import { useEffect } from "react"; // Import useEffect
import { Spinner } from "@/components/ui/spinner"; // Assuming a spinner component exists

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth(); // Use the auth hook
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin"); // Redirect to sign-in if not authenticated
    } else if (!loading && user && userData && userData.role !== "seller") {
      router.push("/"); // Redirect if authenticated but not a seller
    }
  }, [user, userData, loading, router]);

  if (loading || !user || (user && userData && userData.role !== "seller")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    ); // Show spinner while loading or redirecting
  }

  return (
    <SidebarProvider>
      <SellerSidebar />
      <SidebarInset>
        <SellerHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
