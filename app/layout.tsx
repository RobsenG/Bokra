import type { Metadata } from "next";
import "./globals.css";
import AIChatbot from "@/components/common/AIChatbot";

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
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#111827] font-sans">
        {children}
        <AIChatbot />
      </body>
    </html>
  );
}
