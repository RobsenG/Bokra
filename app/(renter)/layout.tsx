import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export default async function RenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f7] dark:bg-[#0c0b09] font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
