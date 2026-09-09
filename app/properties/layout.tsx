import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f7] dark:bg-[#0f0f18] text-neutral-900 dark:text-white font-sans transition-colors duration-200">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
