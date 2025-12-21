"use client";

import { usePathname } from "next/navigation";
import Footer from "./components/Footer";

export default function AppBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFooter = pathname !== "/messages";

  return (
    <>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </main>
      {showFooter && <Footer />}
    </>
  );
}
