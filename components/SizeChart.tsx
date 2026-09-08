'use client';

import React from 'react';
import { Ruler, ShieldCheck, Info, Shirt } from 'lucide-react';

interface SizeChartProps {
  compact?: boolean;
}

export default function SizeChart({ compact = false }: SizeChartProps) {
  // Exact size chart data from official vendor image:
  // S: P 69, L 48 | M: P 71, L 50 | L: P 73, L 52 | XL: P 75, L 54 | 2XL: P 77, L 56 | 3XL: P 79, L 58
  const SIZES = [
    { size: 'S', panjang: '69', lebar: '48', lingkarDada: '96 cm', bbRec: '50-60 kg' },
    { size: 'M', panjang: '71', lebar: '50', lingkarDada: '100 cm', bbRec: '60-70 kg' },
    { size: 'L', panjang: '73', lebar: '52', lingkarDada: '104 cm', bbRec: '70-80 kg' },
    { size: 'XL', panjang: '75', lebar: '54', lingkarDada: '108 cm', bbRec: '80-90 kg' },
    { size: '2XL', panjang: '77', lebar: '56', lingkarDada: '112 cm', bbRec: '90-100 kg' },
    { size: '3XL', panjang: '79', lebar: '58', lingkarDada: '116 cm', bbRec: '>100 kg' },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-brand-sky/40 shadow-card space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-brand-royal font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-brand-royal/10 px-2.5 py-0.5 rounded-full mb-1">
            <Ruler className="w-3.5 h-3.5 text-brand-royal" />
            <span>Official Size Chart Vendor</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-extrabold text-brand-navy font-display">
            Panduan Ukuran Jersey (P &amp; L)
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">
            P = Panjang baju (cm) | L = Lebar ketiak ke ketiak (cm)
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-brand-yellow/15 border border-brand-yellow/40 text-brand-navy px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold w-fit">
          <Shirt className="w-3.5 h-3.5 text-brand-royal" />
          <span>Unisex Fit</span>
        </div>
      </div>

      {/* Table Container (Ultra Compact - No Horizontal Scroll on Mobile) */}
      <div className="rounded-xl sm:rounded-2xl border border-brand-sky/30 shadow-sm bg-white overflow-hidden">
        <table className="w-full text-center border-collapse table-fixed">
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
            {SIZES.map((row, idx) => (
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

      {/* Guide Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs text-slate-600 pt-0.5">
        <div className="p-2.5 bg-brand-iceBg rounded-xl border border-brand-sky/30 flex items-start space-x-2">
          <Info className="w-3.5 h-3.5 text-brand-royal flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-brand-navy block font-bold">Patokan Ukuran:</strong>
            <span><strong>P</strong> = Panjang baju (kera ke bawah) | <strong>L</strong> = Lebar dada (ketiak ke ketiak).</span>
          </div>
        </div>

        <div className="p-2.5 bg-brand-iceBg rounded-xl border border-brand-sky/30 flex items-start space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-brand-navy block font-bold">Tips Kenyamanan:</strong>
            <span>Jika suka potongan lebih santai (*Comfort Fit*), disarankan memilih 1 size di atasnya.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
