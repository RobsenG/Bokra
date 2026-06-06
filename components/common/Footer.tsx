import React from "react";
import Link from "next/link";
import { Building, MapPin, Phone, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-sm">B</span>
              </div>
              <span>Bokra Stay</span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Ethiopia's premier AI-powered short-term rental platform. Connecting travelers with authentic stays and verified hosts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Stays in Ethiopia</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link href="/?city=Addis+Ababa" className="hover:text-teal-400 transition-colors">Addis Ababa</Link>
              </li>
              <li>
                <Link href="/?city=Hawassa" className="hover:text-teal-400 transition-colors">Hawassa</Link>
              </li>
              <li>
                <Link href="/?city=Hossana" className="hover:text-teal-400 transition-colors">Hossana</Link>
              </li>
              <li>
                <Link href="/?city=Bahir+Dar" className="hover:text-teal-400 transition-colors">Bahir Dar</Link>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Hosting</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link href="/register?role=HOST" className="hover:text-teal-400 transition-colors">List Your Property</Link>
              </li>
              <li>
                <Link href="/host/dashboard" className="hover:text-teal-400 transition-colors">Host Dashboard</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition-colors">Host Guidelines</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition-colors">Safety & Security</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 shrink-0 text-teal-400 mt-0.5" />
                <span>Bole Road, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-teal-400" />
                <span>+251 911 234567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-teal-400" />
                <span>support@bokrastay.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Bokra Stay. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="size-3 text-red-500 fill-red-500" /> in Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}
