'use client';

import React from 'react';
import { Ruler, ShieldCheck, Info, Check, Shirt } from 'lucide-react';

interface SizeChartProps {
  compact?: boolean;
}

export default function SizeChart({ compact = false }: SizeChartProps) {
  const SIZES = [
    { size: 'S', lingkarDada: '90 - 94 cm', lebarDada: '46 cm', panjangDepan: '58 cm', panjangBelakang: '66 cm', bbRec: '50 - 60 kg' },
    { size: 'M', lingkarDada: '95 - 98 cm', lebarDada: '48 cm', panjangDepan: '60 cm', panjangBelakang: '68 cm', bbRec: '60 - 70 kg' },
    { size: 'L', lingkarDada: '99 - 103 cm', lebarDada: '50 cm', panjangDepan: '62 cm', panjangBelakang: '70 cm', bbRec: '70 - 80 kg' },
    { size: 'XL', lingkarDada: '104 - 108 cm', lebarDada: '53 cm', panjangDepan: '64 cm', panjangBelakang: '72 cm', bbRec: '80 - 90 kg' },
    { size: 'XXL', lingkarDada: '109 - 113 cm', lebarDada: '55 cm', panjangDepan: '66 cm', panjangBelakang: '74 cm', bbRec: '90 - 100 kg' },
    { size: '3XL', lingkarDada: '114 - 118 cm', lebarDada: '58 cm', panjangDepan: '68 cm', panjangBelakang: '76 cm', bbRec: '> 100 kg' },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-brand-sky/40 shadow-card space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-brand-royal font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-brand-royal/10 px-3 py-1 rounded-full mb-1.5">
            <Ruler className="w-3.5 h-3.5 text-brand-royal" />
            <span>Official Size Guide</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy font-display">
            Tabel Ukuran Official Jersey 2026
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Panduan patokan ukuran badan (Unisex Fit) untuk Short &amp; Long Sleeve.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-brand-yellow/15 border border-brand-yellow/40 text-brand-navy px-3 py-1.5 rounded-xl text-xs font-bold w-fit">
          <Shirt className="w-4 h-4 text-brand-royal" />
          <span>Pro-Fit Cut (Bisa Naik 1 Size)</span>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll for Mobile */}
      <div className="overflow-x-auto rounded-2xl border border-brand-sky/30 shadow-sm bg-white">
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-gradient-to-r from-brand-navy via-brand-navyLight to-brand-royalDark text-white font-bold text-xs uppercase">
              <th className="py-3.5 px-4 rounded-tl-xl">Ukuran</th>
              <th className="py-3.5 px-4 text-brand-yellow">Lingkar Dada</th>
              <th className="py-3.5 px-4">Lebar Dada (Half)</th>
              <th className="py-3.5 px-4">Panjang Depan</th>
              <th className="py-3.5 px-4">Panjang Belakang</th>
              <th className="py-3.5 px-4 rounded-tr-xl">Est. Berat Badan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {SIZES.map((row, idx) => (
              <tr
                key={row.size}
                className={`hover:bg-brand-iceBg/80 transition-colors ${
                  idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                }`}
              >
                <td className="py-3 px-4 font-black text-brand-navy text-sm sm:text-base flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-lg bg-brand-royal/10 text-brand-royal flex items-center justify-center text-xs font-bold">
                    {row.size}
                  </span>
                </td>
                <td className="py-3 px-4 font-extrabold text-brand-royal">{row.lingkarDada}</td>
                <td className="py-3 px-4">{row.lebarDada}</td>
                <td className="py-3 px-4">{row.panjangDepan}</td>
                <td className="py-3 px-4">{row.panjangBelakang}</td>
                <td className="py-3 px-4 text-slate-500 font-semibold">{row.bbRec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Guide & Measurement Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
        <div className="p-3.5 bg-brand-iceBg rounded-2xl border border-brand-sky/30 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-brand-royal flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-brand-navy block font-bold mb-0.5">Panduan Memilih Ukuran:</strong>
            <span>Jika Anda menyukai potongan ketat aerobik (*Pro Fit*), pilih ukuran pas badan. Jika lebih suka agak longgar (*Comfort Fit*), disarankan naik 1 ukuran.</span>
          </div>
        </div>

        <div className="p-3.5 bg-brand-iceBg rounded-2xl border border-brand-sky/30 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-brand-navy block font-bold mb-0.5">Toleransi Ukuran Fabric:</strong>
            <span>Bahan jersey elastis melar (stretch). Toleransi pemotongan dan jahit pabrik ±1 – 2 cm.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
