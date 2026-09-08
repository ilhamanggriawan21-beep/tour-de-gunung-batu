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

          {/* Left Section: Logo PEADERAL x RUDEBOYS */}
          <Link href="/" className="flex items-center justify-center group py-0.5 shrink-0">
            <img
              src="/images/logo_peaderal_x_rudeboys.png"
              alt="Logo PEADERAL x RUDEBOYS"
              className="h-8 sm:h-10 md:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(244,199,22,0.6)]"
            />
          </Link>

          {/* Center Section: Desktop Navigation Links (Clean & Centered, No Overlap!) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 mx-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center space-x-1.5 group whitespace-nowrap ${
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

          {/* Right Section: Desktop & Mobile Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* CTA Button */}
            <Link
              href="/daftar"
              className="relative group overflow-hidden bg-gradient-to-r from-brand-yellow via-amber-300 to-brand-yellow hover:from-amber-300 hover:to-brand-yellow text-brand-navy font-black px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-[0_0_20px_rgba(244,199,22,0.4)] hover:shadow-[0_0_30px_rgba(244,199,22,0.7)] transition-all duration-300 hover:scale-105 flex items-center space-x-1 sm:space-x-1.5 text-xs uppercase tracking-wider active:scale-95"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/30 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-out" />
              <Bike className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-navy" />
              <span className="hidden sm:inline">Daftar Sekarang</span>
              <span className="sm:hidden font-black">Daftar</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 text-brand-sky hover:text-white focus:outline-none transition-colors border border-white/15 active:scale-95"
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

