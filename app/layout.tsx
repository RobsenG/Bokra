import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AIChatbot from "@/components/common/AIChatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bokra Stay — Short-Term Rentals in Ethiopia",
    template: "%s | Bokra Stay",
  },
  description:
    "Discover and book verified short-term rentals across Ethiopia. From cozy apartments in Addis Ababa to tranquil villas in Hawassa — Bokra Stay connects travelers with trusted hosts.",
  keywords: ["Ethiopia rentals", "Addis Ababa accommodation", "short-term rental Ethiopia", "Bokra Stay"],
  openGraph: {
    title: "Bokra Stay — Short-Term Rentals in Ethiopia",
    description: "Discover verified stays across Ethiopia with Bokra Stay.",
    type: "website",
    locale: "en_ET",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50">
        {children}
        <AIChatbot />
      </body>
    </html>
  );
}
