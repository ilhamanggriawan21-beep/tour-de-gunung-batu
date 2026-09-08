'use client';

import React, { useState } from 'react';
import { Heart, Instagram, Play, ExternalLink, Sparkles, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface ReelItem {
  id: string;
  code: string;
  title: string;
  tag: string;
}

const REELS_DATA: ReelItem[] = [
  { id: '1', code: 'DO2SFquCRKS', title: 'Penyaluran Sepeda Anak Yatim #1', tag: 'Aksi Nyata PEADERAL' },
  { id: '2', code: 'DO-I9QsiZwo', title: 'Senyum Kebahagiaan Dhuafa #2', tag: 'Sepeda Impian' },
  { id: '3', code: 'DPfrN88iQ6I', title: 'Dokumentasi Penyerahan Sepeda #3', tag: 'Amanah Donasi' },
  { id: '4', code: 'DXjokvNiZQg', title: 'Berbagi Sepeda &amp; Harapan #4', tag: 'Pergerakan PEADERAL' },
  { id: '5', code: 'DYl0GFbuTQ4', title: 'Penyerahan Unit Sepeda Yatim #5', tag: 'Senyum Yatim' },
  { id: '6', code: 'DZus2u7uOEg', title: 'Gowes Berbagi Kebahagiaan #6', tag: 'Solidaritas' },
  { id: '7', code: 'DZ91A4NOatq', title: 'Penyaluran Sepeda Pelajar #7', tag: 'Aksi Nyata PEADERAL' },
  { id: '8', code: 'DcNzsxOuSox', title: 'Dokumentasi Sepeda Dhuafa #8', tag: '100% Utuh Donasi' },
  { id: '9', code: 'DcQm8OzumZl', title: 'Penyerahan Sepeda &amp; Senyuman #9', tag: 'Berkah Berbagi' },
  { id: '10', code: 'DcTMdgCun97', title: 'Titipan Donasi Tersalurkan #10', tag: 'Amanah 100%' },
  { id: '11', code: 'Dcc_PWfOmgp', title: 'Aksi Nyata PEADERAL Berbagi #11', tag: 'Sepeda Yatim' },
];

export default function PeaderalImpactGallery() {
  const [selectedReel, setSelectedReel] = useState<ReelItem>(REELS_DATA[0]);

  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-6 space-y-2">
        <div className="inline-flex items-center space-x-2 text-rose-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Bukti Nyata Penyaluran PEADERAL</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-display leading-tight">
          Aksi Nyata Penyerahan Sepeda Yatim &amp; Dhuafa
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed px-2">
          Lihat langsung dokumentasi penyerahan sepeda oleh pergerakan <strong className="text-brand-royal">PEADERAL</strong>. 100% keuntungan PO Jersey ini disalurkan utuh tanpa potongan fee platform.
        </p>
      </div>

      {/* Main Display: Iframe Embed Player & Side/Bottom Reel Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-5xl mx-auto">
        {/* Left/Main Column: Embedded Reel Player */}
        <div className="lg:col-span-7 bg-brand-navy rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-brand-yellow/60 shadow-glow text-white flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs font-bold text-brand-yellow mb-2 px-1">
            <span className="flex items-center gap-1.5">
              <Instagram className="w-4 h-4 text-brand-yellow" />
              {selectedReel.tag}
            </span>
            <a
              href={`https://www.instagram.com/reel/${selectedReel.code}/`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-brand-sky hover:text-white flex items-center gap-1 font-semibold"
            >
              <span>Buka di Instagram</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Reel Frame Container */}
          <div className="relative w-full aspect-[9/16] max-h-[480px] sm:max-h-[520px] rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
            <iframe
              src={`https://www.instagram.com/reel/${selectedReel.code}/embed`}
              className="w-full h-full border-0 rounded-xl"
              allowTransparency
              allow="encrypted-media"
              title={selectedReel.title}
            />
          </div>

          <div className="mt-3 text-center">
            <h4 className="font-extrabold text-sm sm:text-base text-white">{selectedReel.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Dokumentasi Resmi Pergerakan Berbagi Sepeda PEADERAL
            </p>
          </div>
        </div>

        {/* Right/Side Column: Interactive Reel Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-extrabold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
              <Play className="w-4 h-4 text-brand-royal fill-brand-royal" />
              Pilih Reel Dokumentasi (11 Video)
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              100% Real Impact
            </span>
          </div>

          {/* Scrollable Reel List */}
          <div className="space-y-2 max-h-[420px] sm:max-h-[460px] overflow-y-auto pr-1">
            {REELS_DATA.map((reel) => {
              const isSelected = selectedReel.code === reel.code;
              return (
                <button
                  key={reel.id}
                  type="button"
                  onClick={() => setSelectedReel(reel)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-brand-navy text-white border-brand-yellow shadow-md font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-brand-sky hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                        isSelected ? 'bg-brand-yellow text-brand-navy' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{reel.id}
                    </div>
                    <div className="min-w-0">
                      <h5 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {reel.title}
                      </h5>
                      <span className={`text-[10px] block truncate ${isSelected ? 'text-brand-sky' : 'text-slate-400'}`}>
                        {reel.tag}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-brand-yellow" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Instagram Profile Callout */}
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 flex items-center justify-between text-xs pt-3">
            <div className="flex items-center space-x-2">
              <Instagram className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-semibold text-[11px]">Ikuti update penyerahan sepeda di @peaderal</span>
            </div>
            <a
              href="https://www.instagram.com/peaderal/"
              target="_blank"
              rel="noreferrer"
              className="bg-rose-600 text-white px-2.5 py-1 rounded-lg font-extrabold text-[10px] hover:bg-rose-700 transition-colors whitespace-nowrap"
            >
              Follow @peaderal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
