'use client';

import React, { useState } from 'react';
import TopoBackground from '@/components/TopoBackground';
import BibCard from '@/components/BibCard';
import { BadgeCheck, Download, Sparkles, User, Shield } from 'lucide-react';

export default function CocardPanitiaPage() {
  const [namaPanitia, setNamaPanitia] = useState('NAMA PANITIA');
  const [divisiPanitia, setDivisiPanitia] = useState('LOGISTIK');

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative bg-brand-iceBg">
      <TopoBackground />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-brand-yellow text-brand-navy font-black text-xs px-4 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
            <BadgeCheck className="w-4 h-4 text-brand-navy" />
            <span>Official Event Committee Cocard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy font-display">
            Generator Cocard / Name Tag Panitia
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Tour de Gunung Batu 2026 — Masukkan nama & divisi Anda untuk mempratinjau serta mengunduh Cocard Panitia resmi dalam format PNG resolusi tinggi siap cetak.
          </p>
        </div>

        {/* Input Control Card */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-sky/40 shadow-card max-w-2xl mx-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-brand-royal" />
                <span>Nama Lengkap Panitia</span>
              </label>
              <input
                type="text"
                value={namaPanitia}
                onChange={(e) => setNamaPanitia(e.target.value)}
                placeholder="Contoh: ILHAM ANGGRA"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-extrabold text-slate-900 bg-slate-50 focus:bg-white focus:border-brand-royal focus:ring-2 focus:ring-brand-royal/20 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-brand-royal" />
                <span>Divisi Panitia</span>
              </label>
              <input
                type="text"
                value={divisiPanitia}
                onChange={(e) => setDivisiPanitia(e.target.value)}
                placeholder="Contoh: LOGISTIK / ACARA / MARSHAL"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-extrabold text-slate-900 bg-slate-50 focus:bg-white focus:border-brand-royal focus:ring-2 focus:ring-brand-royal/20 transition-all text-sm"
              />
            </div>
          </div>

          {/* Quick Presets for Division */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Pilihan Divisi Cepat:</span>
            <div className="flex flex-wrap gap-1.5">
              {['LOGISTIK', 'ACARA', 'MARSHAL', 'MEDIS', 'DOKUMENTASI', 'REGISTRASI', 'HUMAS', 'KETUA'].map((div) => (
                <button
                  key={div}
                  type="button"
                  onClick={() => setDivisiPanitia(div)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
                    divisiPanitia.toUpperCase() === div
                      ? 'bg-brand-royal text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview & Download Card */}
        <div className="bg-slate-900 p-4 sm:p-6 rounded-3xl border border-brand-yellow/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between text-xs text-brand-yellow font-bold px-2">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Pratinjau Live Kartu Cocard Panitia (Font Sakana + High Resolution)</span>
            </span>
          </div>

          <BibCard
            namaLengkap={namaPanitia || 'PANITIA'}
            divisi={divisiPanitia || 'PANITIA'}
            isPanitia={true}
          />
        </div>
      </div>
    </div>
  );
}
