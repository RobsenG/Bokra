import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-[#9ca3af] border-t border-[#1f2937]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-white inline-block">
              Bokra<span className="text-[#a855f7]">Stay</span>
            </Link>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              Find homes, apartments, and guest stays across Ethiopia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Stays in Ethiopia</h3>
            <ul className="space-y-2 text-sm text-[#9ca3af]">
              <li>
                <Link href="/?city=Addis+Ababa" className="hover:text-[#a855f7] transition-colors">Addis Ababa</Link>
              </li>
              <li>
                <Link href="/?city=Hawassa" className="hover:text-[#a855f7] transition-colors">Hawassa</Link>
              </li>
              <li>
                <Link href="/?city=Hossana" className="hover:text-[#a855f7] transition-colors">Hossana</Link>
              </li>
              <li>
                <Link href="/?city=Bahir+Dar" className="hover:text-[#a855f7] transition-colors">Bahir Dar</Link>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Hosting</h3>
            <ul className="space-y-2 text-sm text-[#9ca3af]">
              <li>
                <Link href="/register?role=HOST" className="hover:text-[#a855f7] transition-colors">List your property</Link>
              </li>
              <li>
                <Link href="/host/dashboard" className="hover:text-[#a855f7] transition-colors">Host dashboard</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#a855f7] transition-colors">Host guidelines</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#a855f7] transition-colors">Safety &amp; security</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-2.5 text-sm text-[#9ca3af]">
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 shrink-0 text-[#a855f7] mt-0.5" />
                <span>Bole Road, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-[#a855f7]" />
                <span>+251 911 234567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-[#a855f7]" />
                <span>support@bokrastay.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b7280]">
          <p>© {new Date().getFullYear()} Bokra Stay. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="size-3 text-red-500 fill-red-500" /> in Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}
