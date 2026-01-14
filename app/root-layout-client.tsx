"use client";

import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export default function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
