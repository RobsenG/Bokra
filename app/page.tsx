import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Search, Shield, Star, MapPin, BadgeCheck, Sparkles, Users, Home, CreditCard, Cpu } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import LandingSearchForm from "@/components/common/LandingSearchForm";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  let properties: any[] = [];
  try {
    properties = await prisma.property.findMany({
      where: { isVerified: true, isAvailable: true },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { reviews: { select: { rating: true } } },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch featured properties:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">

        {/* HERO */}
        <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white overflow-hidden min-h-[92vh] flex items-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-teal-400 rounded-full blur-[160px] opacity-15 pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-emerald-400 rounded-full blur-[140px] opacity-15 pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 py-24 md:py-32 text-center max-w-5xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-teal-100 border border-white/15 backdrop-blur-sm mb-8 uppercase tracking-wider">
              <Sparkles className="size-3.5 text-orange-400 fill-orange-400" />
              {"Ethiopia's Trusted Short-Stay Platform"}
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Find Your Perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300">
                Stay in Ethiopia
              </span>
            </h1>

            <p className="text-teal-100/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 font-light">
              Verified properties. Secure bookings. Trusted hosts.
              <br className="hidden sm:block" />
              From Addis Ababa to Hawassa — find your home away from home.
            </p>

            <div className="max-w-3xl mx-auto">
              <LandingSearchForm isLoggedIn={isLoggedIn} />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-teal-200/70">
              <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-teal-400" /> Admin Verified Listings</span>
              <span className="flex items-center gap-2"><Shield className="size-4 text-teal-400" /> Secure Chapa Payments</span>
              <span className="flex items-center gap-2"><Sparkles className="size-4 text-teal-400" /> AI-Powered Support</span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-14">
              <span className="text-teal-600 font-bold text-xs uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mt-2 tracking-tight">Simple. Fast. Trusted.</h2>
              <p className="text-neutral-500 text-sm mt-3 max-w-md mx-auto">Booking your perfect stay in Ethiopia has never been this easy.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Search, title: "1. Search", desc: "Browse verified properties across Ethiopia using city, price, bedrooms, and date filters.", bg: "bg-teal-50", text: "text-teal-600" },
                { icon: CreditCard, title: "2. Book", desc: "Secure your dates with our booking engine and pay safely through Chapa payment gateway.", bg: "bg-orange-50", text: "text-orange-600" },
                { icon: Home, title: "3. Stay", desc: "Enjoy your stay with verified hosts and 24/7 AI-powered support throughout your visit.", bg: "bg-emerald-50", text: "text-emerald-600" },
              ].map(({ icon: Icon, title, desc, bg, text }) => (
                <div key={title} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 text-center space-y-4 hover:shadow-md transition-shadow duration-300">
                  <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${text}`}>
                    <Icon className="size-7" />
                  </div>
                  <h3 className="font-bold text-neutral-900 text-lg">{title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PROPERTIES */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <span className="text-teal-600 font-bold text-xs uppercase tracking-widest block mb-1">Top Stays</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">Featured Properties</h2>
                <p className="text-neutral-500 text-sm mt-1">Handpicked verified stays across Ethiopia</p>
              </div>
              <Link
                href={isLoggedIn ? "/properties" : "/login?message=Please+sign+in+to+search+and+book+properties"}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors shrink-0"
              >
                View All Properties →
              </Link>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-neutral-200 rounded-3xl">
                <MapPin className="size-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No properties available at the moment. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => {
                  const totalRating = property.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
                  const avgRating = property.reviews.length > 0 ? (totalRating / property.reviews.length).toFixed(1) : null;
                  const href = isLoggedIn ? `/properties/${property.id}` : "/login?message=Please+sign+in+to+view+and+book+properties";
                  return (
                    <Link href={href} key={property.id} className="group">
                      <article className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                        <div className="relative aspect-video overflow-hidden bg-neutral-100">
                          {property.images[0] ? (
                            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300"><MapPin className="size-10" /></div>
                          )}
                          <span className="absolute top-3 left-3 bg-white/95 text-neutral-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">{property.city}</span>
                          {property.isVerified && (
                            <span className="absolute top-3 right-3 bg-teal-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <BadgeCheck className="size-3 fill-white" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h3 className="font-bold text-neutral-800 line-clamp-1 group-hover:text-teal-600 transition-colors">{property.title}</h3>
                              {avgRating && (
                                <div className="flex items-center gap-1 text-orange-500 text-sm font-semibold shrink-0">
                                  <Star className="size-3.5 fill-orange-500" />{avgRating}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-neutral-400 line-clamp-2">{property.description}</p>
                          </div>
                          <div>
                            <div className="flex gap-3 text-xs text-neutral-400 pb-3 border-b border-neutral-100">
                              <span>{property.bedrooms} Beds</span><span>•</span>
                              <span>{property.bathrooms} Baths</span><span>•</span>
                              <span>{property.maxGuests} Guests</span>
                            </div>
                            <div className="flex items-center justify-between pt-3">
                              <span className="text-xs text-neutral-400">Per night</span>
                              <span className="font-extrabold text-teal-700 text-lg">{Number(property.pricePerNight).toLocaleString()} ETB</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* WHY BOKRA STAY */}
        <section className="py-24 bg-neutral-50 border-t border-neutral-100">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-14">
              <span className="text-teal-600 font-bold text-xs uppercase tracking-widest">Why Us</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mt-2 tracking-tight">Why Bokra Stay?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: BadgeCheck, title: "Admin Verified", desc: "Every listing is reviewed and approved by our admin team before going live.", bg: "bg-teal-50", text: "text-teal-600" },
                { icon: Shield, title: "Secure Payments", desc: "Pay confidently with Chapa, Ethiopia's trusted payment gateway.", bg: "bg-orange-50", text: "text-orange-600" },
                { icon: Cpu, title: "AI Powered", desc: "Smart review summaries and recommendations powered by Groq AI.", bg: "bg-violet-50", text: "text-violet-600" },
                { icon: Users, title: "Local First", desc: "Built for Ethiopia, by Ethiopians. Supporting local hosts and communities.", bg: "bg-emerald-50", text: "text-emerald-600" },
              ].map(({ icon: Icon, title, desc, bg, text }) => (
                <div key={title} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-3 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${text}`}><Icon className="size-6" /></div>
                  <h3 className="font-bold text-neutral-900">{title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-br from-teal-900 to-emerald-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="container mx-auto px-4 relative z-10 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center"><Home className="size-6 text-orange-400" /></div>
                <h3 className="text-2xl font-extrabold">Have a property?</h3>
                <p className="text-teal-100/80 text-sm leading-relaxed">List it on Bokra Stay and start earning income from verified renters across Ethiopia.</p>
                <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-500/20">
                  Become a Host
                </Link>
              </div>
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-teal-400/20 flex items-center justify-center"><Search className="size-6 text-teal-400" /></div>
                <h3 className="text-2xl font-extrabold">Ready to find your stay?</h3>
                <p className="text-teal-100/80 text-sm leading-relaxed">Browse verified properties and book your perfect Ethiopian getaway today.</p>
                <Link href={isLoggedIn ? "/properties" : "/register"} className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-colors">
                  Browse Properties
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
