import type { Metadata } from "next";
import "./globals.css";
import AIChatbot from "@/components/common/AIChatbot";
import { ThemeProvider } from "@/components/common/ThemeProvider";

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
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#faf9f7] dark:bg-[#0a0a0f] text-[#1a1208] dark:text-[#f8f6f0] font-sans transition-colors duration-300">
        <ThemeProvider>
          {children}
          <AIChatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
