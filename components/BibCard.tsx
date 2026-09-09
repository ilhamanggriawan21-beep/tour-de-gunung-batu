'use client';

import React, { useRef } from 'react';
import { Download, Share2, Bike, Heart } from 'lucide-react';
import { downloadBibCard } from '@/lib/downloadBib';
import localFont from 'next/font/local';

const sakanaFont = localFont({
  src: '../public/fonts/Sakana.ttf',
  display: 'swap',
});

interface BibCardProps {
  nomorBib: number;
  namaLengkap: string;
  komunitas: string;
  nomorRegistrasi: string;
  jenisRegistrasi: 'daftar_saja' | 'po_jersey';
}

export default function BibCard({
  nomorBib,
  namaLengkap,
  komunitas,
  nomorRegistrasi,
  jenisRegistrasi
}: BibCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    downloadBibCard({
      nomorBib,
      namaLengkap,
      komunitas,
      nomorRegistrasi,
      jenisRegistrasi
    });
  };

  const handleShareWA = () => {
    const text = `Halo! Saya sudah resmi terdaftar di Tour de Gunung Batu 2026 dengan Nomor BIB #${nomorBib}!\nYuk ikut gowes dan donasi jersey amal di: https://tour-de-gunung-batu.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-xl mx-auto my-6">
        {/* BIB Template Container with 1.419 Aspect Ratio */}
        <div className="relative w-full aspect-[21014/14808] rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-yellow/60 group bg-slate-900">
          {/* Base Template Image */}
          <img
            src="/bib-template-revisi.png?v=3"
            alt="Tour de Gunung Batu BIB Template REVISI"
            className="w-full h-full object-cover select-none"
          />

          {/* OVERLAY ELEMENTS (Custom Layout based on user design directive) */}
          <div className="absolute inset-0 pointer-events-none">
            
            {/* 1. TOP-RIGHT BADGE: OFFICIAL PARTICIPANT */}
            <div className="absolute top-[28.5%] right-[4%] transform -translate-y-1/2 z-10">
              <span className="bg-[#0A1338] text-brand-yellow text-[8px] sm:text-[10px] md:text-[11.5px] font-black px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full border-2 border-brand-yellow shadow-md uppercase tracking-wider block text-center">
                OFFICIAL PARTICIPANT
              </span>
            </div>

            {/* 2. PURE WHITE BOX ZONE (Only Large BIB Number & Participant Name using Sakana Font) */}
            <div className="absolute top-[37%] bottom-[32%] left-[5%] right-[5%] flex flex-col items-center justify-center">
              {/* Main BIB Number */}
              <div className="text-center w-full my-auto">
                <span className={`${sakanaFont.className} text-[5.5rem] sm:text-[6.5rem] md:text-[8.5rem] text-[#0A1338] tracking-tight drop-shadow-[0_4px_12px_rgba(244,199,22,0.35)] block leading-none`}>
                  {String(nomorBib).padStart(3, '0')}
                </span>
                <h3 className="text-sm sm:text-xl md:text-2xl text-[#0A1338] font-black uppercase tracking-wide truncate max-w-[90%] mx-auto -mt-5">
                  {namaLengkap}
                </h3>
              </div>
            </div>

            {/* 3. ROUTE BANNER (Shifted 2% further down to top-[75%]) */}
            <div className="absolute top-[75%] w-full bg-[#0A1338]/95 py-1 px-2 text-center border-y border-brand-yellow/50 shadow-md">
              <span className="text-[7px] sm:text-[9px] md:text-[11px] font-black text-brand-yellow tracking-widest block uppercase">
                JONGGOL → GUNUNG BATU &nbsp;•&nbsp; ELEVATION GAIN ±700M &nbsp;•&nbsp; SELF-SUPPORTED
              </span>
            </div>

            {/* 4. PROMINENT PRIDE BADGES (Shifted 2% further down to top-[90.5%] in the photo section) */}
            <div className="absolute top-[90.5%] transform -translate-y-1/2 flex items-center justify-center flex-wrap gap-1.5 sm:gap-2.5 px-3 w-full">
              <span className="bg-[#1D3AAE] text-white text-[8px] sm:text-[11px] md:text-[13px] font-black px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-xl shadow-lg border border-white/20 truncate max-w-[55%] uppercase tracking-wide">
                KOMUNITAS: {(komunitas || 'UMUM').toUpperCase()}
              </span>
              <span className="bg-[#0A1338] text-brand-yellow text-[8px] sm:text-[11px] md:text-[13px] font-mono font-black px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-xl shadow-lg border border-brand-yellow/60">
                REG: {nomorRegistrasi}
              </span>
              {jenisRegistrasi === 'po_jersey' && (
                <span className="bg-brand-yellow text-[#0A1338] text-[8px] sm:text-[11px] md:text-[13px] font-black px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-xl shadow-lg flex items-center border border-[#0A1338]">
                  <Heart className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-1 fill-[#0A1338]" /> PO JERSEY
                </span>
              )}
            </div>

          </div>
        </div>

      {/* Buttons Action */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          className="w-full sm:w-auto bg-brand-yellow hover:bg-amber-400 text-brand-navy font-bold px-6 py-3 rounded-xl shadow-glow transition-transform hover:scale-105 flex items-center justify-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Nomor BIB (PNG)</span>
        </button>
        <button
          onClick={handleShareWA}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-transform hover:scale-105 flex items-center justify-center space-x-2 text-sm"
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan ke WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
