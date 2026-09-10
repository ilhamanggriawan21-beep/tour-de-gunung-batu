'use client';

import React, { useRef, useState } from 'react';
import { Download, Share2, Bike, Heart, Loader2, X } from 'lucide-react';
import { saveOrShareImage, generateBibCanvas } from '@/lib/downloadBib';
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
  const [downloading, setDownloading] = useState(false);
  const [iosModalUrl, setIosModalUrl] = useState<string | null>(null);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      if (typeof document !== 'undefined' && 'fonts' in document) {
        await document.fonts.ready;
      }

      // Generate direct 2.5K image directly - zero DOM responsive scaling issues, zero dark Safari screens
      const canvas = await generateBibCanvas({
        nomorBib,
        namaLengkap,
        komunitas,
        nomorRegistrasi,
        jenisRegistrasi,
      });

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Gagal menghasilkan file gambar.');

      await saveOrShareImage(
        blob,
        `BIB_TOUR_DE_GUNUNG_BATU_${nomorBib}.png`,
        `BIB #${nomorBib}`,
        (url) => setIosModalUrl(url)
      );
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal memproses gambar BIB. Silakan coba kembali.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWA = () => {
    const text = `Halo! Saya sudah resmi terdaftar di Tour de Gunung Batu 2026 dengan Nomor BIB #${nomorBib}!\nYuk ikut gowes dan donasi jersey amal di: https://tour-de-gunung-batu.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-xl mx-auto my-6">
        {/* BIB Template Container with 1.419 Aspect Ratio */}
        <div
          ref={cardRef}
          className="relative w-full aspect-[21014/14808] rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-yellow/60 group bg-slate-900"
        >
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
            <div className="absolute top-[37%] bottom-[32%] left-[4%] right-[4%] flex flex-col items-center justify-center">
              {/* Main BIB Number */}
              <div className="text-center w-full my-auto">
                <span className={`${sakanaFont.className} text-[5rem] sm:text-[6.5rem] md:text-[8.5rem] text-[#0A1338] tracking-tight drop-shadow-[0_4px_12px_rgba(244,199,22,0.35)] block leading-[0.9]`}>
                  {String(nomorBib).padStart(3, '0')}
                </span>
                <h3 className="text-xs sm:text-lg md:text-2xl text-[#0A1338] font-black uppercase tracking-wide truncate max-w-[90%] mx-auto mt-0.5 sm:mt-1">
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

            {/* 4. PROMINENT PRIDE BADGES (Always 1 single line on all screens) */}
            <div className="absolute top-[90.5%] transform -translate-y-1/2 flex items-center justify-center flex-nowrap gap-1 sm:gap-2 px-2 w-full max-w-full">
              <span className="bg-[#1D3AAE] text-white text-[7.5px] xs:text-[9px] sm:text-[11px] md:text-[13px] font-black px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl shadow-md border border-white/20 truncate max-w-[46%] uppercase tracking-wide whitespace-nowrap shrink-0">
                KOMUNITAS: {(komunitas || 'UMUM').toUpperCase()}
              </span>
              <span className="bg-[#0A1338] text-brand-yellow text-[7.5px] xs:text-[9px] sm:text-[11px] md:text-[13px] font-mono font-black px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl shadow-md border border-brand-yellow/60 whitespace-nowrap shrink-0">
                REG: {nomorRegistrasi}
              </span>
              {jenisRegistrasi === 'po_jersey' && (
                <span className="bg-brand-yellow text-[#0A1338] text-[7.5px] xs:text-[9px] sm:text-[11px] md:text-[13px] font-black px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl shadow-md flex items-center border border-[#0A1338] whitespace-nowrap shrink-0">
                  <Heart className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 fill-[#0A1338]" /> PO JERSEY
                </span>
              )}
            </div>

          </div>
        </div>

      {/* Buttons Action */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full sm:w-auto bg-brand-yellow hover:bg-amber-400 text-brand-navy font-bold px-6 py-3 rounded-xl shadow-glow transition-transform hover:scale-105 flex items-center justify-center space-x-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses Gambar BIB...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Unduh Nomor BIB (PNG)</span>
            </>
          )}
        </button>
        <button
          onClick={handleShareWA}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-transform hover:scale-105 flex items-center justify-center space-x-2 text-sm"
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan ke WhatsApp</span>
        </button>
      </div>

      {/* iOS / Fallback Save Image Modal */}
      {iosModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-brand-yellow/50 rounded-3xl p-5 max-w-lg w-full text-center text-white shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIosModalUrl(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-3 text-left">
              <span className="text-xs font-black text-brand-yellow uppercase tracking-wider block">
                Petunjuk Simpan Gambar (iPhone / iPad)
              </span>
              <p className="text-xs text-slate-300 mt-1">
                <strong>Tekan dan tahan</strong> gambar BIB di bawah ini, lalu pilih <strong>"Simpan ke Foto" (Save to Photos)</strong> atau <strong>"Bagikan"</strong>.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/20 shadow-lg mb-4 bg-slate-950">
              <img
                src={iosModalUrl}
                alt={`Nomor BIB ${nomorBib}`}
                className="w-full h-auto object-contain select-auto"
              />
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={iosModalUrl}
                download={`BIB_TOUR_DE_GUNUNG_BATU_${nomorBib}.png`}
                className="w-full bg-brand-yellow hover:bg-amber-400 text-brand-navy font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Buka / Unduh File Gambar</span>
              </a>
              <button
                onClick={() => setIosModalUrl(null)}
                className="w-full bg-white/10 hover:bg-white/20 text-slate-300 py-2 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
