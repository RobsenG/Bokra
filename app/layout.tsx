import type { Metadata } from "next";
import "./globals.css";
import AIChatbot from "@/components/common/AIChatbot";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { AuthProvider } from "@/components/common/AuthProvider";

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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bokra-theme');var isDark=t?t==='dark':(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#faf9f7] dark:bg-[#0a0a0f] text-[#1a1208] dark:text-[#f8f6f0] font-sans transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <AIChatbot />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
