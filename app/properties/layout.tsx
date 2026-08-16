import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
