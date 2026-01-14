"use client"; // Add this line if not already present

import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { useAuth } from "@/components/auth-provider"; // Import useAuth
import { useRouter } from "next/navigation"; // Import useRouter
import { useEffect } from "react"; // Import useEffect
import { Spinner } from "@/components/ui/spinner"; // Assuming a spinner component exists

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth(); // Use the auth hook
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin"); // Redirect to sign-in if not authenticated
    } else if (!loading && user && userData && userData.role !== "admin") {
      router.push("/"); // Redirect if authenticated but not an admin
    }
  }, [user, userData, loading, router]);

  if (loading || !user || (user && userData && userData.role !== "admin")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    ); // Show spinner while loading or redirecting
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <SidebarInset>
          <AdminHeader />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}