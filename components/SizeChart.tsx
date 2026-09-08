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
    { size: 'S', panjang: '69 cm', lebar: '48 cm', lingkarDada: '96 cm', bbRec: '50 - 60 kg' },
    { size: 'M', panjang: '71 cm', lebar: '50 cm', lingkarDada: '100 cm', bbRec: '60 - 70 kg' },
    { size: 'L', panjang: '73 cm', lebar: '52 cm', lingkarDada: '104 cm', bbRec: '70 - 80 kg' },
    { size: 'XL', panjang: '75 cm', lebar: '54 cm', lingkarDada: '108 cm', bbRec: '80 - 90 kg' },
    { size: '2XL', panjang: '77 cm', lebar: '56 cm', lingkarDada: '112 cm', bbRec: '90 - 100 kg' },
    { size: '3XL', panjang: '79 cm', lebar: '58 cm', lingkarDada: '116 cm', bbRec: '> 100 kg' },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-brand-sky/40 shadow-card space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-brand-royal font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-brand-royal/10 px-3 py-1 rounded-full mb-1.5">
            <Ruler className="w-3.5 h-3.5 text-brand-royal" />
            <span>Official Vendor Specs</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy font-display">
            SIZE CHART OFFICIAL JERSEY
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Panduan ukuran resmi (Panjang &amp; Lebar dalam cm).
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-brand-yellow/15 border border-brand-yellow/40 text-brand-navy px-3 py-1.5 rounded-xl text-xs font-bold w-fit">
          <Shirt className="w-4 h-4 text-brand-royal" />
          <span>Unisex Fit (Short &amp; Long Sleeve)</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-brand-sky/30 shadow-sm bg-white">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-brand-navy via-brand-navyLight to-brand-royalDark text-white font-bold text-xs uppercase">
              <th className="py-3 px-4 rounded-tl-xl text-center w-20">SIZE</th>
              <th className="py-3 px-4 text-brand-yellow text-center">P (Panjang)</th>
              <th className="py-3 px-4 text-brand-yellow text-center">L (Lebar)</th>
              <th className="py-3 px-4 text-center">Lingkar Dada</th>
              <th className="py-3 px-4 rounded-tr-xl text-center">Est. Berat Badan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {SIZES.map((row, idx) => (
              <tr
                key={row.size}
                className={`hover:bg-brand-iceBg transition-colors text-center ${
                  idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                }`}
              >
                <td className="py-3 px-4 font-black text-brand-navy text-sm sm:text-base">
                  <span className="inline-block px-2.5 py-0.5 rounded-lg bg-brand-royal/10 text-brand-royal font-bold">
                    {row.size}
                  </span>
                </td>
                <td className="py-3 px-4 font-extrabold text-brand-navy text-sm sm:text-base">
                  {row.panjang}
                </td>
                <td className="py-3 px-4 font-extrabold text-brand-royal text-sm sm:text-base">
                  {row.lebar}
                </td>
                <td className="py-3 px-4 text-slate-600 font-semibold">
                  ±{row.lingkarDada}
                </td>
                <td className="py-3 px-4 text-slate-500 font-medium">
                  {row.bbRec}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Guide Notes (From Image Caption) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
        <div className="p-3.5 bg-brand-iceBg rounded-2xl border border-brand-sky/30 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-brand-royal flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-brand-navy block font-bold mb-0.5">Keterangan Pengukuran:</strong>
            <span><strong>P</strong> = Panjang baju (cm) | <strong>L</strong> = Lebar baju ketiak ke ketiak (cm). Lingkar dada = Lebar &times; 2.</span>
          </div>
        </div>

        <div className="p-3.5 bg-brand-iceBg rounded-2xl border border-brand-sky/30 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-brand-navy block font-bold mb-0.5">Tips Memilih Ukuran:</strong>
            <span>Jika Anda ragu antara 2 ukuran atau menyukai kenyamanan (*Comfort Fit*), disarankan memilih 1 ukuran lebih besar.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
