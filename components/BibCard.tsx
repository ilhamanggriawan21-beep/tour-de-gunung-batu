'use client';

import React, { useRef } from 'react';
import { Download, Share2, Bike, Heart } from 'lucide-react';

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
    if (!cardRef.current) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;

    // Background Navy
    ctx.fillStyle = '#0A1338';
    ctx.fillRect(0, 0, 800, 500);

    // Top Border Accent (Yellow & Royal Blue)
    ctx.fillStyle = '#F4C716';
    ctx.fillRect(0, 0, 800, 16);
    ctx.fillStyle = '#1D3AAE';
    ctx.fillRect(0, 16, 800, 12);

    // Header Title
    ctx.fillStyle = '#F4C716';
    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PEADERAL x RUDEBOYS CYCLIST', 400, 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('TOUR DE GUNUNG BATU', 400, 100);

    ctx.fillStyle = '#A8CBEE';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('27 SEPTEMBER 2026 • JONGGOL → GUNUNG BATU', 400, 130);

    // BIB Number Box
    ctx.fillStyle = '#1D3AAE';
    ctx.beginPath();
    ctx.roundRect(150, 160, 500, 170, 20);
    ctx.fill();
    ctx.strokeStyle = '#F4C716';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Large BIB Number
    ctx.fillStyle = '#F4C716';
    ctx.font = '900 100px sans-serif';
    ctx.fillText(`#${nomorBib}`, 400, 280);

    // Participant Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 30px sans-serif';
    ctx.fillText(namaLengkap.toUpperCase(), 400, 380);

    // Community
    ctx.fillStyle = '#A8CBEE';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(`KOMUNITAS: ${(komunitas || 'UMUM').toUpperCase()}`, 400, 420);

    // Footer info & Registration Code
    ctx.fillStyle = '#F4C716';
    ctx.font = '600 14px sans-serif';
    ctx.fillText(`REG CODE: ${nomorRegistrasi} | ELEVATION GAIN ±1000M+`, 400, 465);

    // Trigger Download
    const link = document.createElement('a');
    link.download = `BIB_TOUR_DE_GUNUNG_BATU_${nomorBib}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShareWA = () => {
    const text = `Halo! Saya sudah resmi terdaftar di Tour de Gunung Batu 2026 dengan Nomor BIB #${nomorBib}!\nYuk ikut gowes dan donasi jersey amal di: https://tourdegunungbatu.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-xl mx-auto my-6">
      {/* BIB Card Frame */}
      <div
        ref={cardRef}
        className="bg-gradient-to-b from-brand-navy via-brand-navyLight to-brand-royalDark rounded-3xl p-6 sm:p-8 border-4 border-brand-yellow shadow-glow text-center text-white relative overflow-hidden"
      >
        {/* Topographic Lines Decor */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#1D3AAE_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-brand-sky/20 pb-4 mb-4">
          <div className="text-left">
            <span className="font-extrabold text-xs text-brand-yellow tracking-widest block font-display">
              PEADERAL x RUDEBOYS
            </span>
            <span className="font-bold text-lg sm:text-xl text-white block">TOUR DE GUNUNG BATU</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-brand-sky uppercase font-semibold block">TANGGAL EVENT</span>
            <span className="text-xs font-extrabold text-brand-yellow block">27 SEPT 2026</span>
          </div>
        </div>

        {/* Big BIB Number Display */}
        <div className="my-6 py-6 px-4 bg-brand-royal/60 rounded-2xl border-2 border-brand-yellow/80 shadow-inner relative">
          <span className="text-[11px] text-brand-sky font-bold uppercase tracking-widest block mb-1">
            OFFICIAL PARTICIPANT BIB NUMBER
          </span>
          <span className="text-6xl sm:text-7xl font-extrabold text-brand-yellow font-display tracking-tight drop-shadow-md">
            #{nomorBib}
          </span>
          <p className="text-[10px] text-brand-sky/80 mt-1 italic">
            "Nomor BIB #{nomorBib} — Bagian dari Elevasi Kolektif ±1000m+"
          </p>
        </div>

        {/* Participant Specs */}
        <div className="space-y-1 mb-6">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide uppercase">
            {namaLengkap}
          </h3>
          <p className="text-sm font-semibold text-brand-sky">
            KOMUNITAS: <span className="text-white">{komunitas || 'UMUM'}</span>
          </p>
          <div className="pt-2 flex items-center justify-center space-x-2">
            <span className="text-xs font-mono bg-black/40 text-brand-sky px-3 py-1 rounded-full border border-white/10">
              REG: {nomorRegistrasi}
            </span>
            {jenisRegistrasi === 'po_jersey' && (
              <span className="text-xs font-bold bg-brand-yellow text-brand-navy px-3 py-1 rounded-full flex items-center">
                <Heart className="w-3 h-3 mr-1 fill-brand-navy" /> Partisipan PO Jersey
              </span>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-4 border-t border-brand-sky/20 flex items-center justify-between text-[11px] text-brand-sky">
          <span className="flex items-center">
            <Bike className="w-3.5 h-3.5 mr-1 text-brand-yellow" /> JONGGOL → GUNUNG BATU
          </span>
          <span>SELF-SUPPORTED EVENT</span>
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
