'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Users, FileText, HelpCircle, ArrowRight, Bike, Sparkles, ShieldCheck, Flame } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Flame },
    { href: '/wall-of-heroes', label: 'Wall of Heroes', icon: Users },
    { href: '/peraturan', label: 'Peraturan', icon: FileText },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
    { href: '/susulan-po', label: 'Cek Status / PO', icon: ShieldCheck },
  ];

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300">
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <div
          className={`relative transition-all duration-500 rounded-full px-3.5 sm:px-6 py-2 sm:py-2.5 border text-white flex items-center justify-between shadow-2xl ${
            scrolled
              ? 'bg-brand-navy/90 backdrop-blur-2xl border-brand-yellow/50 shadow-[0_8px_32px_rgba(10,19,56,0.6)] ring-1 ring-brand-yellow/20'
              : 'bg-brand-navy/75 backdrop-blur-xl border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
          }`}
        >
          {/* Subtle Glow Behind Navbar */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-royal/30 via-brand-yellow/20 to-brand-royal/30 rounded-full blur-md opacity-50 -z-10 animate-pulse pointer-events-none" />

          {/* Logo Branding - Dynamic Glass Pill */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group py-1">
            <div className="relative p-1 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all border border-white/15 shadow-inner">
              <img
                src="/images/logo_peaderal_x_rudeboys.png"
                alt="Logo PEADERAL x RUDEBOYS"
                className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(244,199,22,0.6)]"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-1">
                <span className="font-black text-xs sm:text-sm tracking-wider text-brand-yellow font-display uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  PEADERAL
                </span>
                <span className="text-brand-sky text-[11px] font-black">×</span>
                <span className="font-black text-xs sm:text-sm tracking-wider text-white font-display uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  RUDEBOYS
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[9px] sm:text-[10px] font-extrabold text-brand-sky tracking-widest uppercase">
                  27 SEPT 2026
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-black/20 backdrop-blur-md p-1.5 rounded-full border border-white/10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center space-x-1.5 group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-royal via-blue-600 to-brand-royal text-white shadow-lg shadow-brand-royal/40 ring-1 ring-white/30'
                      : 'text-slate-200 hover:text-brand-yellow hover:bg-white/10'
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${
                        isActive ? 'text-brand-yellow' : 'text-brand-sky group-hover:text-brand-yellow'
                      }`}
                    />
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/daftar"
              className="relative group overflow-hidden bg-gradient-to-r from-brand-yellow via-amber-300 to-brand-yellow hover:from-amber-300 hover:to-brand-yellow text-brand-navy font-black px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(244,199,22,0.4)] hover:shadow-[0_0_30px_rgba(244,199,22,0.7)] transition-all duration-300 hover:scale-105 flex items-center space-x-2 text-xs uppercase tracking-wider"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/30 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-out" />
              <Bike className="w-4 h-4 text-brand-navy" />
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center space-x-2">
            <Link
              href="/daftar"
              className="bg-gradient-to-r from-brand-yellow to-amber-400 text-brand-navy font-black text-[11px] px-3.5 py-1.5 rounded-full shadow-lg shadow-brand-yellow/30 flex items-center space-x-1 uppercase tracking-wide active:scale-95 transition-transform"
            >
              <span>Daftar</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-brand-sky hover:text-white focus:outline-none transition-colors border border-white/15"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5 h-5 text-brand-yellow" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Glass Drawer */}
        {isOpen && (
          <div className="lg:hidden mt-2.5 bg-brand-navy/95 backdrop-blur-2xl border border-brand-yellow/40 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-2 animate-fadeIn text-white ring-1 ring-white/10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-royal to-blue-600 text-white shadow-lg shadow-brand-royal/40 ring-1 ring-white/20'
                      : 'text-slate-200 hover:bg-white/10 hover:text-brand-yellow'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {Icon ? (
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-yellow' : 'text-brand-sky'}`} />
                    ) : (
                      <Sparkles className="w-4 h-4 text-brand-sky" />
                    )}
                    <span>{link.label}</span>
                  </div>
                  {isActive && <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" />}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-white/10">
              <Link
                href="/daftar"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-brand-yellow via-amber-300 to-brand-yellow text-brand-navy font-black py-3.5 rounded-2xl shadow-[0_0_20px_rgba(244,199,22,0.4)] text-xs uppercase tracking-wider active:scale-95 transition-transform"
              >
                <Bike className="w-4 h-4 text-brand-navy" />
                <span>Daftar Event &amp; PO Jersey</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

