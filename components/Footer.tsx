import React from 'react';
import Link from 'next/link';
import { Bike, Heart, Shield, Lock, ExternalLink, MapPin, Calendar } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white relative overflow-hidden">
      {/* Subtle Topographic Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="footer-topo" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#footer-topo)"/>
        </svg>
      </div>

      {/* Partner Logos Strip — NO BADGE / NO PILL behind logos */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <p className="text-center text-[11px] sm:text-xs font-bold text-brand-sky/50 uppercase tracking-[0.2em] mb-6 sm:mb-8">
            Diselenggarakan oleh
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
            {/* Rudeboys Logo — hitam/putih, perlu invert agar terlihat di background gelap */}
            <div className="group flex flex-col items-center space-y-2.5">
              <img
                src="/images/logo RB.png"
                alt="Rudeboys Cyclist"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
              />
              <span className="text-[10px] sm:text-[11px] font-bold text-brand-sky/50 uppercase tracking-wider">Rudeboys</span>
            </div>

            {/* Separator line */}
            <div className="hidden sm:block w-px h-14 bg-gradient-to-b from-transparent via-brand-sky/20 to-transparent"></div>

            {/* Peaderal Logo — kuning/hijau, terlihat cukup baik di background gelap */}
            <div className="group flex flex-col items-center space-y-2.5">
              <img
                src="/images/L.pea.dc.png"
                alt="PEADERAL MTB Indonesia"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(244,199,22,0.3)]"
              />
              <span className="text-[10px] sm:text-[11px] font-bold text-brand-sky/50 uppercase tracking-wider">Peaderal</span>
            </div>

            {/* Separator line */}
            <div className="hidden sm:block w-px h-14 bg-gradient-to-b from-transparent via-brand-sky/20 to-transparent"></div>

            {/* Peaberbagi.dc Logo — putih, sudah terlihat di background navy gelap */}
            <div className="group flex flex-col items-center space-y-2.5">
              <img
                src="/images/Peaberbagi.dc.png"
                alt="Peaberbagi.dc"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(168,203,238,0.3)]"
              />
              <span className="text-[10px] sm:text-[11px] font-bold text-brand-sky/50 uppercase tracking-wider">Peaberbagi.dc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <Bike className="w-7 h-7 text-brand-yellow flex-shrink-0" />
              <div>
                <span className="font-extrabold text-lg tracking-wider text-brand-yellow font-display block leading-tight">
                  TOUR DE GUNUNG BATU
                </span>
                <span className="text-[10px] text-brand-sky/50 font-medium tracking-wide">
                  PEADERAL x RUDEBOYS CYCLIST • 2026
                </span>
              </div>
            </div>
            <p className="text-sm text-brand-sky/60 leading-relaxed max-w-md">
              Event Gowes Amal Mandiri (Self-Supported) diselenggarakan oleh kolaborasi{" "}
              <strong className="text-white">PEADERAL x Rudeboys Cyclist</strong>. Pendaftaran event 100% GRATIS. Seluruh keuntungan pre-order jersey resmi disalurkan menjadi sepeda untuk anak yatim/piatu &amp; dhuafa.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30">
                <Heart className="w-3 h-3 mr-1.5 fill-brand-yellow" />
                100% Donasi Sepeda
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Shield className="w-3 h-3 mr-1.5" />
                0% Fee Platform
              </span>
            </div>

            {/* Event Key Info */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-brand-sky/40">
              <span className="inline-flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Minggu, 27 September 2026</span>
              </span>
              <span className="inline-flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Tugu Tegar Beriman → Gunung Batu</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-bold text-sm text-brand-yellow mb-4 uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-brand-sky/60 hover:text-white transition-colors duration-200">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/daftar" className="text-brand-sky/60 hover:text-brand-yellow transition-colors duration-200 font-medium">
                  Daftar Event / PO Jersey
                </Link>
              </li>
              <li>
                <Link href="/wall-of-heroes" className="text-brand-sky/60 hover:text-white transition-colors duration-200">
                  Wall of Heroes
                </Link>
              </li>
              <li>
                <Link href="/peraturan" className="text-brand-sky/60 hover:text-white transition-colors duration-200">
                  Peraturan &amp; Waiver
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-brand-sky/60 hover:text-white transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/susulan-po" className="text-brand-sky/60 hover:text-white transition-colors duration-200">
                  Susulan PO / Cek Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Admin */}
          <div>
            <h4 className="font-bold text-sm text-brand-yellow mb-4 uppercase tracking-wider">Mitra &amp; Admin</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://instagram.com/peaderalindonesia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-brand-sky/60 hover:text-brand-yellow transition-colors duration-200"
                >
                  <span>@peaderalindonesia</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/rudeboyscyclist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-brand-sky/60 hover:text-brand-yellow transition-colors duration-200"
                >
                  <span>@rudeboyscyclist</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li className="pt-3">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center space-x-1.5 text-xs text-brand-sky/30 hover:text-white transition-colors duration-200 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/10"
                >
                  <Lock className="w-3 h-3 text-brand-yellow/50" />
                  <span>Portal Admin Panitia</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-brand-sky/35">
            <p>© 2026 Tour de Gunung Batu. PEADERAL x Rudeboys Cyclist. All Rights Reserved.</p>
            <p className="flex items-center space-x-1">
              <Heart className="w-3 h-3 fill-rose-500/50 text-rose-500/50" />
              <span>Berbayar dengan Senyuman</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
