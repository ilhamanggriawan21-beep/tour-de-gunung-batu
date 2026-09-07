'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Users, FileText, HelpCircle, ArrowRight, Bike } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-navy/95 backdrop-blur-md border-b border-brand-sky/20 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Branding */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group min-w-0">
            <img
              src="/images/logo_peaderal_x_rudeboys.png"
              alt="Logo PEADERAL x RUDEBOYS"
              className="h-8 sm:h-10 w-auto object-contain flex-shrink-0 group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(244,199,22,0.4)]"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="font-extrabold text-xs sm:text-sm tracking-wider text-brand-yellow font-display uppercase">
                  PEADERAL
                </span>
                <span className="text-brand-sky/60 text-[10px] sm:text-xs font-bold">×</span>
                <span className="font-extrabold text-xs sm:text-sm tracking-wider text-white font-display uppercase">
                  RUDEBOYS
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] text-brand-sky/60 tracking-wide font-medium truncate">
                TOUR DE GUNUNG BATU • 27 SEPT 2026
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-5 text-sm font-semibold">
            <Link href="/" className="text-white hover:text-brand-yellow transition-colors duration-200">
              Beranda
            </Link>
            <Link href="/wall-of-heroes" className="text-brand-sky/80 hover:text-brand-yellow transition-colors duration-200 flex items-center space-x-1">
              <Users className="w-4 h-4 text-brand-yellow/70" />
              <span>Wall of Heroes</span>
            </Link>
            <Link href="/peraturan" className="text-brand-sky/80 hover:text-brand-yellow transition-colors duration-200 flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Peraturan</span>
            </Link>
            <Link href="/faq" className="text-brand-sky/80 hover:text-brand-yellow transition-colors duration-200 flex items-center space-x-1">
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </Link>
            <Link href="/susulan-po" className="text-brand-sky/80 hover:text-brand-yellow transition-colors duration-200 text-xs bg-white/5 px-2.5 py-1 rounded-full border border-white/15 hover:border-brand-yellow/40">
              Cek Status / Susulan PO
            </Link>
          </nav>

          {/* CTA Desktop */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/daftar"
              className="bg-gradient-to-r from-brand-yellow to-amber-400 hover:from-amber-400 hover:to-brand-yellow text-brand-navy font-bold px-5 py-2.5 rounded-full shadow-glow transition-all hover:scale-105 flex items-center space-x-2 text-sm animate-pulse-glow"
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-white/10 text-brand-sky hover:text-white focus:outline-none transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-brand-navy/98 backdrop-blur-lg border-b border-brand-sky/20 px-4 pt-2 pb-5 space-y-1">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Beranda
          </Link>
          <Link
            href="/daftar"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-bold text-brand-yellow hover:bg-white/10 transition-colors"
          >
            🚴 Daftar Event / PO Jersey
          </Link>
          <Link
            href="/wall-of-heroes"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-brand-sky/80 hover:bg-white/10 transition-colors"
          >
            Wall of Heroes
          </Link>
          <Link
            href="/peraturan"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-brand-sky/80 hover:bg-white/10 transition-colors"
          >
            Peraturan Event
          </Link>
          <Link
            href="/faq"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-brand-sky/80 hover:bg-white/10 transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/susulan-po"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-brand-sky/80 hover:bg-white/10 transition-colors"
          >
            Cek Status / Susulan PO Jersey
          </Link>
          <div className="pt-3 px-1">
            <Link
              href="/daftar"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-gradient-to-r from-brand-yellow to-amber-400 text-brand-navy font-bold py-3 rounded-xl shadow-glow text-sm"
            >
              Daftar Sekarang (Gratis)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
