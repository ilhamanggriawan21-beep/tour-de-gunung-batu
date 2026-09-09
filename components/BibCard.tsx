'use client';

import React, { useRef } from 'react';
import { Download, Share2, Bike, Heart } from 'lucide-react';
import { downloadBibCard } from '@/lib/downloadBib';

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
            src="/images/bib-template.png"
            alt="Tour de Gunung Batu BIB Template"
            className="w-full h-full object-cover select-none"
          />

          {/* OVERLAY ELEMENTS (Positioned relative to template aspect ratio) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center">
            
            {/* Top Pill Badge: OFFICIAL PARTICIPANT (Lowered slightly to top-[34%] to avoid logo text overlap) */}
            <div className="absolute top-[34%] transform -translate-y-1/2">
              <span className="bg-[#0A1338] text-brand-yellow text-[8px] sm:text-[10px] md:text-[12px] font-black px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full border border-brand-yellow/80 shadow-md uppercase tracking-widest">
                OFFICIAL PARTICIPANT
              </span>
            </div>

            {/* Main BIB Number (Padded 3-digits without hash symbol for official race look) */}
            <div className="absolute top-[47.5%] transform -translate-y-1/2 text-center w-full">
              <span className="text-6xl sm:text-7xl md:text-8xl font-black text-[#0A1338] font-display tracking-tight drop-shadow-[0_2px_10px_rgba(244,199,22,0.35)]">
                {String(nomorBib).padStart(3, '0')}
              </span>
            </div>

            {/* Participant Name */}
            <div className="absolute top-[59%] transform -translate-y-1/2 text-center w-full px-4">
              <h3 className="text-xs sm:text-lg md:text-xl font-black text-[#0A1338] uppercase tracking-wide truncate max-w-[90%] mx-auto">
                {namaLengkap}
              </h3>
            </div>

            {/* Row 1 Badges: Community & Reg Code */}
            <div className="absolute top-[66%] transform -translate-y-1/2 flex items-center justify-center gap-1.5 sm:gap-2 px-2 w-full">
              <span className="bg-[#1D3AAE] text-white text-[8px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md shadow-sm truncate max-w-[50%]">
                {(komunitas || 'UMUM').toUpperCase()}
              </span>
              <span className="bg-[#0A1338] text-brand-yellow text-[8px] sm:text-[10px] font-mono font-bold px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md shadow-sm">
                REG: {nomorRegistrasi}
              </span>
              {jenisRegistrasi === 'po_jersey' && (
                <span className="bg-brand-yellow text-[#0A1338] text-[8px] sm:text-[10px] font-black px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md shadow-sm flex items-center">
                  <Heart className="w-2.5 h-2.5 mr-0.5 fill-[#0A1338]" /> PO JERSEY
                </span>
              )}
            </div>

            {/* Subtle Route Info (Integrated seamlessly at top of footer photo) */}
            <div className="absolute top-[73.5%] w-full bg-[#0A1338]/85 py-1 px-2 text-center backdrop-blur-[2px]">
              <span className="text-[7px] sm:text-[9px] md:text-[10px] font-extrabold text-brand-yellow tracking-wider block uppercase">
                JONGGOL → GUNUNG BATU &nbsp;•&nbsp; ELEVATION GAIN ±700M &nbsp;•&nbsp; SELF-SUPPORTED
              </span>
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
