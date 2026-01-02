"use client";

import "./globals.css";
import { Navbar } from "./components/Navbar";
import AppBody from "./AppBody";
import { usePathname } from "next/navigation";

export default function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      {isAdminRoute ? (
        children
      ) : (
        <AppBody>{children}</AppBody>
      )}
    </>
  );
}
