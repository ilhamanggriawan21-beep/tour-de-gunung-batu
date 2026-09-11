'use client';

import React, { useState } from 'react';
import { Ruler, ShieldCheck, Info, Shirt, Sparkles, User, Baby } from 'lucide-react';

interface SizeChartProps {
  compact?: boolean;
}

export default function SizeChart({ compact = false }: SizeChartProps) {
  const [activeTab, setActiveTab] = useState<'dewasa' | 'anak'>('dewasa');

  // Size chart resmi dewasa vendor
  const ADULT_SIZES = [
    { size: 'S', panjang: '69', lebar: '48', lingkarDada: '96 cm', bbRec: '50-60 kg' },
    { size: 'M', panjang: '71', lebar: '50', lingkarDada: '100 cm', bbRec: '60-70 kg' },
    { size: 'L', panjang: '73', lebar: '52', lingkarDada: '104 cm', bbRec: '70-80 kg' },
    { size: 'XL', panjang: '75', lebar: '54', lingkarDada: '108 cm', bbRec: '80-90 kg' },
    { size: '2XL', panjang: '77', lebar: '56', lingkarDada: '112 cm', bbRec: '90-100 kg' },
    { size: '3XL', panjang: '79', lebar: '58', lingkarDada: '116 cm', bbRec: '>100 kg' },
    { size: '4XL', panjang: '81', lebar: '60', lingkarDada: '120 cm', bbRec: '>110 kg' },
    { size: '5XL', panjang: '83', lebar: '62', lingkarDada: '124 cm', bbRec: '>120 kg' },
  ];

  // Size chart resmi jersey anak-anak
  const KIDS_SIZES = [
    { size: '2XS', panjang: '45', lebar: '33', lingkarDada: '66 cm', usiaRec: '1 - 2 Tahun' },
    { size: 'XS', panjang: '48', lebar: '35', lingkarDada: '70 cm', usiaRec: '3 - 4 Tahun' },
    { size: 'S', panjang: '50', lebar: '37', lingkarDada: '74 cm', usiaRec: '5 - 6 Tahun' },
    { size: 'M', panjang: '53', lebar: '39', lingkarDada: '78 cm', usiaRec: '7 - 8 Tahun' },
    { size: 'L', panjang: '55', lebar: '41', lingkarDada: '82 cm', usiaRec: '8 - 9 Tahun' },
    { size: 'XL', panjang: '58', lebar: '43', lingkarDada: '86 cm', usiaRec: '10 - 11 Tahun' },
    { size: '2XL', panjang: '62', lebar: '45', lingkarDada: '90 cm', usiaRec: '12 - 13 Tahun' },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-brand-sky/40 shadow-card space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-brand-royal font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-brand-royal/10 px-2.5 py-0.5 rounded-full mb-1">
            <Ruler className="w-3.5 h-3.5 text-brand-royal" />
            <span>Official Size Chart Vendor</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-extrabold text-brand-navy font-display">
            Panduan Ukuran Jersey (P &amp; L)
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">
            P = Panjang baju (cm) | L = Lebar dada ketiak ke ketiak (cm)
          </p>
        </div>

        {/* Tab Switcher: Dewasa vs Anak-Anak */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dewasa')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'dewasa'
                ? 'bg-brand-navy text-brand-yellow shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Dewasa (Adult)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('anak')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'anak'
                ? 'bg-brand-royal text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Baby className="w-3.5 h-3.5 text-amber-300" />
            <span>Anak-Anak (Kids)</span>
          </button>
        </div>
      </div>

      {/* Adult Table */}
      {activeTab === 'dewasa' && (
        <div className="rounded-xl sm:rounded-2xl border border-brand-sky/30 shadow-sm bg-white overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[420px] text-center border-collapse table-fixed">
            <thead>
              <tr className="bg-gradient-to-r from-brand-navy via-brand-navyLight to-brand-royalDark text-white font-bold text-[11px] sm:text-xs uppercase">
                <th className="py-2 sm:py-3 px-1 w-[18%]">SIZE</th>
                <th className="py-2 sm:py-3 px-1 text-brand-yellow w-[20%]">P (cm)</th>
                <th className="py-2 sm:py-3 px-1 text-brand-yellow w-[20%]">L (cm)</th>
                <th className="py-2 sm:py-3 px-1 w-[22%]">Lingkar</th>
                <th className="py-2 sm:py-3 px-1 w-[20%]">Est. BB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {ADULT_SIZES.map((row, idx) => (
                <tr
                  key={row.size}
                  className={`hover:bg-brand-iceBg transition-colors text-center ${
                    idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                  }`}
                >
                  <td className="py-2 sm:py-2.5 px-0.5">
                    <span className="inline-block px-1.5 sm:px-2 py-0.5 rounded-md bg-brand-royal/10 text-brand-royal font-bold text-xs sm:text-sm">
                      {row.size}
                    </span>
                  </td>
                  <td className="py-2 sm:py-2.5 px-0.5 font-extrabold text-brand-navy text-xs sm:text-sm">
                    {row.panjang}
                  </td>
                  <td className="py-2 sm:py-2.5 px-0.5 font-extrabold text-brand-royal text-xs sm:text-sm">
                    {row.lebar}
                  </td>
                  <td className="py-2 sm:py-2.5 px-0.5 text-slate-600 font-semibold text-[11px] sm:text-xs">
                    {row.lingkarDada}
                  </td>
                  <td className="py-2 sm:py-2.5 px-0.5 text-slate-500 font-medium text-[10px] sm:text-xs">
                    {row.bbRec}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Kids Table */}
      {activeTab === 'anak' && (
        <div className="space-y-3">
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Tersedia lengan pendek maupun lengan panjang untuk goweser cilik!</span>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-brand-sky/30 shadow-sm bg-white overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[420px] text-center border-collapse table-fixed">
              <thead>
                <tr className="bg-gradient-to-r from-brand-royal via-blue-700 to-brand-navy text-white font-bold text-[11px] sm:text-xs uppercase">
                  <th className="py-2 sm:py-3 px-1 w-[22%]">SIZE ANAK</th>
                  <th className="py-2 sm:py-3 px-1 text-brand-yellow w-[20%]">P (cm)</th>
                  <th className="py-2 sm:py-3 px-1 text-brand-yellow w-[20%]">L (cm)</th>
                  <th className="py-2 sm:py-3 px-1 w-[20%]">Lingkar</th>
                  <th className="py-2 sm:py-3 px-1 w-[18%]">Est. Usia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {KIDS_SIZES.map((row, idx) => (
                  <tr
                    key={row.size}
                    className={`hover:bg-brand-iceBg transition-colors text-center ${
                      idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                    }`}
                  >
                    <td className="py-2 sm:py-2.5 px-0.5">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-xs sm:text-sm">
                        {row.size}
                      </span>
                    </td>
                    <td className="py-2 sm:py-2.5 px-0.5 font-extrabold text-brand-navy text-xs sm:text-sm">
                      {row.panjang}
                    </td>
                    <td className="py-2 sm:py-2.5 px-0.5 font-extrabold text-brand-royal text-xs sm:text-sm">
                      {row.lebar}
                    </td>
                    <td className="py-2 sm:py-2.5 px-0.5 text-slate-600 font-semibold text-[11px] sm:text-xs">
                      {row.lingkarDada}
                    </td>
                    <td className="py-2 sm:py-2.5 px-0.5 text-emerald-700 font-bold text-[11px] sm:text-xs">
                      {row.usiaRec}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guide Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs text-slate-600 pt-0.5">
        <div className="p-2.5 bg-brand-iceBg rounded-xl border border-brand-sky/30 flex items-start space-x-2">
          <Info className="w-3.5 h-3.5 text-brand-royal flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-brand-navy block font-bold">Patokan Ukuran:</strong>
            <span><strong>P</strong> = Panjang baju (kera ke bawah) | <strong>L</strong> = Lebar dada (ketiak ke ketiak). Toleransi jahitan ±1-2 cm.</span>
          </div>
        </div>

        <div className="p-2.5 bg-brand-iceBg rounded-xl border border-brand-sky/30 flex items-start space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-brand-navy block font-bold">Jaminan Pas:</strong>
            <span>Jika ragu antara 2 ukuran, sangat disarankan memilih 1 tingkat ukuran di atasnya (*upsize*).</span>
          </div>
        </div>
      </div>
    </div>
  );
}
