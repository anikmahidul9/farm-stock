"use client";

import { Navbar } from "../components/Navbar";
import AppBody from "../AppBody";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <AppBody>{children}</AppBody>
    </>
  );
}
