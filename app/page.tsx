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
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <main className="flex-1">

        {/* HERO */}
        <section className="relative bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#5b21b6] text-white overflow-hidden py-24 md:py-32 flex items-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-[#7c3aed] rounded-full blur-[160px] opacity-20 pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-[#a855f7] rounded-full blur-[140px] opacity-15 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-purple-200 border border-white/15 backdrop-blur-sm mb-8 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
              Book and rent properties safely across Ethiopia
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
              <span className="text-white">Find your next stay </span>
              <span className="text-[#a855f7]">
                in Ethiopia
              </span>
            </h1>

            <p className="text-[#9ca3af] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 font-light">
              Verified properties. Safe bookings. Helpful hosts.
              <br className="hidden sm:block" />
              From Addis Ababa to Hawassa — find your place.
            </p>

            <div className="max-w-3xl mx-auto">
              <LandingSearchForm isLoggedIn={isLoggedIn} />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-[#9ca3af]">
              <span className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-[#a855f7]" /> Verified listings</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-[#a855f7]" /> Secure Chapa payments</span>
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#a855f7]" /> 24/7 AI help</span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 bg-[#f8fafc]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-[#7c3aed] font-bold text-xs uppercase tracking-widest">How it works</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] mt-2 tracking-tight">Simple. Fast. Safe.</h2>
              <p className="text-[#6b7280] text-sm mt-3 max-w-md mx-auto">Book your stay in 3 simple steps.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Search, title: "1. Search", desc: "Browse verified places across Ethiopia by city, price, and dates.", bg: "bg-[#7c3aed]/10", text: "text-[#7c3aed]" },
                { icon: CreditCard, title: "2. Book", desc: "Pick your dates and pay safely with Chapa.", bg: "bg-[#7c3aed]/10", text: "text-[#7c3aed]" },
                { icon: Home, title: "3. Stay", desc: "Enjoy your stay with verified hosts ready to help.", bg: "bg-[#7c3aed]/10", text: "text-[#7c3aed]" },
              ].map(({ icon: Icon, title, desc, bg, text }) => (
                <div key={title} className="bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_1px_3px_0_rgb(0_0_0_/_0.08)] p-8 text-center space-y-4 hover:shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1)] transition-shadow duration-200">
                  <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${text}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-[#111827] text-lg">{title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PROPERTIES */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <span className="text-[#7c3aed] font-bold text-xs uppercase tracking-widest block mb-1">Featured stays</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">Places to stay</h2>
                <p className="text-[#6b7280] text-sm mt-1">Verified properties ready for your trip</p>
              </div>
              <Link
                href={isLoggedIn ? "/properties" : "/login?message=Sign+in+to+search+and+book+properties"}
                className="border-2 border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shrink-0"
              >
                View all properties →
              </Link>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[#e5e7eb] rounded-3xl">
                <MapPin className="w-10 h-10 text-[#6b7280] mx-auto mb-3" />
                <p className="text-[#6b7280] text-sm">No properties found. Try adjusting your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => {
                  const totalRating = property.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
                  const avgRating = property.reviews.length > 0 ? (totalRating / property.reviews.length).toFixed(1) : null;
                  const href = isLoggedIn ? `/properties/${property.id}` : "/login?message=Sign+in+to+view+and+book+properties";
                  return (
                    <Link href={href} key={property.id} className="group">
                      <article className="bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-[0_1px_3px_0_rgb(0_0_0_/_0.08)] hover:shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1)] transition-all duration-200 h-full flex flex-col">
                        <div className="relative aspect-video overflow-hidden bg-[#f8fafc]">
                          {property.images[0] ? (
                            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#6b7280]"><MapPin className="w-10 h-10" /></div>
                          )}
                          <span className="absolute top-3 left-3 bg-white/95 text-[#111827] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">{property.city}</span>
                          {property.isVerified && (
                            <span className="absolute top-3 right-3 bg-[#7c3aed] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                              <BadgeCheck className="w-3 h-3 fill-white" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h3 className="font-bold text-[#111827] line-clamp-1 group-hover:text-[#7c3aed] transition-colors">{property.title}</h3>
                              {avgRating && (
                                <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold shrink-0">
                                  <Star className="w-3.5 h-3.5 fill-amber-500" />{avgRating}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-[#6b7280] line-clamp-2">{property.description}</p>
                          </div>
                          <div>
                            <div className="flex gap-3 text-xs text-[#6b7280] pb-3 border-b border-[#e5e7eb]">
                              <span>{property.bedrooms} Beds</span><span>•</span>
                              <span>{property.bathrooms} Baths</span><span>•</span>
                              <span>{property.maxGuests} Guests</span>
                            </div>
                            <div className="flex items-center justify-between pt-3">
                              <span className="text-xs text-[#6b7280]">Per night</span>
                              <span className="font-extrabold text-[#7c3aed] text-lg">{Number(property.pricePerNight).toLocaleString()} ETB</span>
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
        <section className="py-24 bg-[#f8fafc] border-t border-[#e5e7eb]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-[#7c3aed] font-bold text-xs uppercase tracking-widest">Why us</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] mt-2 tracking-tight">Why Bokra Stay?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: BadgeCheck, title: "Verified hosts", desc: "Every property is checked before going live.", bg: "bg-[#7c3aed]/10", text: "text-[#7c3aed]" },
                { icon: Shield, title: "Secure payments", desc: "Pay safely with Chapa, Ethiopia's trusted payment gateway.", bg: "bg-[#7c3aed]/10", text: "text-[#7c3aed]" },
                { icon: Cpu, title: "Smart AI help", desc: "Instant AI reviews and booking assistance whenever you need.", bg: "bg-[#7c3aed]/10", text: "text-[#7c3aed]" },
                { icon: Users, title: "Built for Ethiopia", desc: "Supporting local hosts and guests across the country.", bg: "bg-[#7c3aed]/10", text: "text-[#7c3aed]" },
              ].map(({ icon: Icon, title, desc, bg, text }) => (
                <div key={title} className="bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_1px_3px_0_rgb(0_0_0_/_0.08)] p-6 space-y-3 hover:shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1)] transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${text}`}><Icon className="w-6 h-6" /></div>
                  <h3 className="font-bold text-[#111827]">{title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-br from-[#111827] to-[#5b21b6] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center"><Home className="w-6 h-6 text-[#a855f7]" /></div>
                <h3 className="text-2xl font-extrabold">Have a property?</h3>
                <p className="text-[#9ca3af] text-sm leading-relaxed">List it on Bokra Stay and start earning income from verified guests.</p>
                <Link href="/register?role=HOST" className="inline-flex items-center justify-center gap-2 bg-[#7c3aed] hover:bg-[#5b21b6] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-[0_4px_14px_0_rgb(124_58_237_/0.25)] transition-all">
                  Become a host
                </Link>
              </div>
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center"><Search className="w-6 h-6 text-[#a855f7]" /></div>
                <h3 className="text-2xl font-extrabold">Ready to find your stay?</h3>
                <p className="text-[#9ca3af] text-sm leading-relaxed">Browse verified properties and book your next stay today.</p>
                <Link href={isLoggedIn ? "/properties" : "/register"} className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
                  Browse properties
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
