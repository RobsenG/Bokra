import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  Search,
  Shield,
  Star,
  MapPin,
  BadgeCheck,
  Sparkles,
  Users,
  Home,
  CreditCard,
  Cpu,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import LandingSearchForm from "@/components/common/LandingSearchForm";
import HomePropertiesSlider, { HomePropertyItem } from "@/components/home/HomePropertiesSlider";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  let properties: any[] = [];
  try {
    properties = await prisma.property.findMany({
      where: { isVerified: true, isAvailable: true },
      orderBy: { createdAt: "desc" },
      include: { reviews: { select: { rating: true } } },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch featured properties:", error);
  }

  const serializableProperties: HomePropertyItem[] = properties.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    city: p.city,
    pricePerNight: Number(p.pricePerNight),
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    maxGuests: p.maxGuests,
    images: p.images || [],
    isVerified: p.isVerified,
    reviews: p.reviews || [],
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f7] dark:bg-[#0c0b09] font-sans">
      <Navbar />
      <main className="flex-1">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="hero-section relative overflow-hidden py-28 md:py-36 flex items-center bg-[#faf9f7] dark:bg-[#0c0b09] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-5%,rgba(201,168,76,0.06)_0%,transparent_65%)]">
          {/* Grid overlay */}
          <div className="absolute inset-0 hero-grid" />
          {/* Gold glow top-right */}
          <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-[#c9a84c] rounded-full blur-[180px] opacity-[0.04] dark:opacity-[0.06] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#b8943d]/10 dark:bg-[#c9a84c]/[0.08] text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/[0.18] backdrop-blur-sm mb-8 uppercase tracking-wider animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Book and rent properties safely across Ethiopia
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 animate-fade-up text-[#1a1208] dark:text-[#f5f0e8]">
              Find your next stay{" "}
              <span className="text-[#b8943d] dark:text-[#c9a84c]">in Ethiopia</span>
            </h1>

            <p className="text-[#6b5e4e] dark:text-[#8a8278] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 font-light animate-fade-up">
              Verified properties. Safe bookings. Helpful hosts.
              <br className="hidden sm:block" />
              From Addis Ababa to Hawassa — find your place.
            </p>

            {/* Search Card */}
            <div className="max-w-3xl mx-auto animate-fade-up">
              <LandingSearchForm isLoggedIn={isLoggedIn} />
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-[#6b5e4e] dark:text-[#8a8278] animate-fade-in stagger-children">
              <span className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-[#b8943d] dark:text-[#c9a84c]" />
                Verified listings
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#b8943d] dark:text-[#c9a84c]" />
                Secure Chapa payments
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#b8943d] dark:text-[#c9a84c]" />
                24/7 AI help
              </span>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
        <section className="py-24 bg-white dark:bg-[#0c0b09]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 animate-fade-up">
              <span className="text-[#b8943d] dark:text-[#c9a84c] font-bold text-xs uppercase tracking-widest">
                How it works
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] mt-2 tracking-tight">
                Simple. Fast. Safe.
              </h2>
              <p className="text-[#6b5e4e] dark:text-[#8a8278] text-sm mt-3 max-w-md mx-auto">
                Book your stay in 3 simple steps.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
              {[
                {
                  icon: Search,
                  step: "01",
                  title: "Search",
                  desc: "Browse verified places across Ethiopia by city, price, and dates.",
                },
                {
                  icon: CreditCard,
                  step: "02",
                  title: "Book",
                  desc: "Pick your dates and pay safely with Chapa.",
                },
                {
                  icon: Home,
                  step: "03",
                  title: "Stay",
                  desc: "Enjoy your stay with verified hosts ready to help.",
                },
              ].map(({ icon: Icon, step, title, desc }) => (
                <div
                  key={title}
                  className="card-hover p-8 text-center space-y-4 animate-fade-up bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-[#fff8dc]/[0.06] rounded-2xl shadow-sm dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]"
                >
                  <div className="relative mx-auto w-14 h-14">
                    <div className="w-14 h-14 rounded-2xl bg-[#b8943d]/[0.08] dark:bg-[#c9a84c]/[0.08] border border-[#b8943d]/15 dark:border-[#c9a84c]/[0.12] flex items-center justify-center">
                      <Icon className="w-7 h-7 text-[#b8943d] dark:text-[#c9a84c]" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-[10px] font-black text-[#b8943d] dark:text-[#c9a84c] bg-[#b8943d]/10 dark:bg-[#c9a84c]/[0.08] border border-[#b8943d]/20 dark:border-[#c9a84c]/[0.18] rounded-full w-5 h-5 flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1a1208] dark:text-[#f5f0e8] text-lg">{title}</h3>
                  <p className="text-sm text-[#6b5e4e] dark:text-[#8a8278] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED PROPERTIES ───────────────────────────────────────── */}
        <section id="featured-properties-section" className="py-24 bg-[#faf9f7] dark:bg-[#0c0b09]">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
              <div className="animate-fade-up">
                <span className="text-[#b8943d] dark:text-[#c9a84c] font-bold text-xs uppercase tracking-widest block mb-1">
                  Featured stays
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
                  Places to stay
                </h2>
                <p className="text-[#6b5e4e] dark:text-[#8a8278] text-sm mt-1">
                  Verified properties ready for your trip in Ethiopia
                </p>
              </div>
              <Link
                href={isLoggedIn ? "/properties" : "/login?message=Sign+in+to+search+and+book+properties"}
                className="btn-secondary shrink-0 flex items-center gap-1.5"
              >
                View all properties
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {serializableProperties.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-black/[0.08] dark:border-[#fff8dc]/[0.06] rounded-3xl">
                <MapPin className="w-10 h-10 text-black/15 dark:text-[#524d47] mx-auto mb-3" />
                <p className="text-[#6b5e4e] dark:text-[#8a8278] text-sm">
                  No properties found. Try adjusting your search.
                </p>
              </div>
            ) : (
              <HomePropertiesSlider
                properties={serializableProperties}
                isLoggedIn={isLoggedIn}
              />
            )}
          </div>
        </section>

        {/* ── WHY BOKRA STAY ────────────────────────────────────────────── */}
        <section className="py-24 bg-white dark:bg-[#0c0b09] border-t border-black/[0.06] dark:border-[#fff8dc]/[0.04]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 animate-fade-up">
              <span className="text-[#b8943d] dark:text-[#c9a84c] font-bold text-xs uppercase tracking-widest">
                Why us
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] mt-2 tracking-tight">
                Why Bokra Stay?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
              {[
                {
                  icon: BadgeCheck,
                  title: "Verified hosts",
                  desc: "Every property is checked before going live.",
                },
                {
                  icon: Shield,
                  title: "Secure payments",
                  desc: "Pay safely with Chapa, Ethiopia's trusted payment gateway.",
                },
                {
                  icon: Cpu,
                  title: "Smart AI help",
                  desc: "Instant AI reviews and booking assistance whenever you need.",
                },
                {
                  icon: Users,
                  title: "Built for Ethiopia",
                  desc: "Supporting local hosts and guests across the country.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card-hover p-6 space-y-3 animate-fade-up bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-[#fff8dc]/[0.05] rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-[#b8943d]/[0.08] dark:bg-[#c9a84c]/[0.08] border border-[#b8943d]/15 dark:border-[#c9a84c]/[0.12] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#b8943d] dark:text-[#c9a84c]" />
                  </div>
                  <h3 className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">{title}</h3>
                  <p className="text-sm text-[#6b5e4e] dark:text-[#8a8278] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="py-24 bg-[#faf9f7] dark:bg-[#0c0b09]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-[#b8943d]/[0.08] dark:from-[#c9a84c]/[0.08] to-[#b8943d]/[0.03] dark:to-[#c9a84c]/[0.03] rounded-3xl border border-[#b8943d]/12 dark:border-[#c9a84c]/[0.12] p-12 animate-fade-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/[0.08] border border-[#b8943d]/20 dark:border-[#c9a84c]/[0.12] flex items-center justify-center">
                    <Home className="w-6 h-6 text-[#b8943d] dark:text-[#c9a84c]" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
                    Have a property?
                  </h3>
                  <p className="text-[#6b5e4e] dark:text-[#8a8278] text-sm leading-relaxed">
                    List it on Bokra Stay and start earning income from verified guests.
                  </p>
                  <Link href="/register?role=HOST" className="btn-primary inline-flex">
                    Become a host
                  </Link>
                </div>
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/[0.08] border border-[#b8943d]/20 dark:border-[#c9a84c]/[0.12] flex items-center justify-center">
                    <Search className="w-6 h-6 text-[#b8943d] dark:text-[#c9a84c]" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
                    Ready to find your stay?
                  </h3>
                  <p className="text-[#6b5e4e] dark:text-[#8a8278] text-sm leading-relaxed">
                    Browse verified properties and book your next stay today.
                  </p>
                  <Link
                    href={isLoggedIn ? "/properties" : "/register"}
                    className="btn-secondary inline-flex"
                  >
                    Browse properties
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
