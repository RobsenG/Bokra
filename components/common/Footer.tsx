import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#f0ede8] dark:bg-[#080806] text-[#6b5e4e] dark:text-[#8a8278] border-t border-black/[0.06] dark:border-[#fff8dc]/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold tracking-tight inline-block">
              <span className="text-[#1a1208] dark:text-[#f5f0e8]">Bokra</span>
              <span className="text-[#b8943d] dark:text-[#c9a84c]">Stay</span>
            </Link>
            <p className="text-sm leading-relaxed text-[#6b5e4e] dark:text-[#8a8278]">
              Find homes, apartments, and guest stays across Ethiopia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#1a1208] dark:text-[#f5f0e8] font-semibold text-xs uppercase tracking-wider mb-4">
              Stays in Ethiopia
            </h3>
            <ul className="space-y-2 text-sm">
              {["Addis Ababa", "Hawassa", "Hossana", "Bahir Dar"].map((city) => (
                <li key={city}>
                  <Link
                    href={`/?city=${encodeURIComponent(city)}`}
                    className="text-[#6b5e4e] dark:text-[#8a8278] hover:text-[#b8943d] dark:hover:text-[#c9a84c] transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="text-[#1a1208] dark:text-[#f5f0e8] font-semibold text-xs uppercase tracking-wider mb-4">
              Hosting
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register?role=HOST" className="text-[#6b5e4e] dark:text-[#8a8278] hover:text-[#b8943d] dark:hover:text-[#c9a84c] transition-colors">
                  List your property
                </Link>
              </li>
              <li>
                <Link href="/host/dashboard" className="text-[#6b5e4e] dark:text-[#8a8278] hover:text-[#b8943d] dark:hover:text-[#c9a84c] transition-colors">
                  Host dashboard
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#6b5e4e] dark:text-[#8a8278] hover:text-[#b8943d] dark:hover:text-[#c9a84c] transition-colors">
                  Host guidelines
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#6b5e4e] dark:text-[#8a8278] hover:text-[#b8943d] dark:hover:text-[#c9a84c] transition-colors">
                  Safety &amp; security
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-[#1a1208] dark:text-[#f5f0e8] font-semibold text-xs uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 shrink-0 text-[#b8943d] dark:text-[#c9a84c] mt-0.5" />
                <span className="text-[#6b5e4e] dark:text-[#8a8278]">Bole Road, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-[#b8943d] dark:text-[#c9a84c]" />
                <span className="text-[#6b5e4e] dark:text-[#8a8278]">+251 911 234567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-[#b8943d] dark:text-[#c9a84c]" />
                <span className="text-[#6b5e4e] dark:text-[#8a8278]">support@bokrastay.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9b8e7e] dark:text-[#524d47]">
          <p>© {new Date().getFullYear()} Bokra Stay. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="size-3 text-red-500 fill-red-500" /> in Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}
