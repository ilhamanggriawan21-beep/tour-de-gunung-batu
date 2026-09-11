'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Bike, ArrowRight, Sparkles, CheckCircle2, Gift } from 'lucide-react';

interface CharityGoalProgressBarProps {
  currentCount: number;
  targetCount?: number;
}

export default function CharityGoalProgressBar({
  currentCount,
  targetCount = 100
}: CharityGoalProgressBarProps) {
  const percentage = Math.min(100, Math.round((currentCount / targetCount) * 100));
  const remaining = Math.max(0, targetCount - currentCount);

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-brand-navy via-brand-navyLight to-brand-royalDark text-white p-5 sm:p-7 border-2 border-brand-yellow/60 shadow-glow overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 space-y-4">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-400 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase text-brand-yellow tracking-widest block">
                Misi Kebaikan • PEADERAL Berbagi
              </span>
              <h3 className="text-base sm:text-xl font-extrabold text-white font-display">
                Target 100 Partisipan Jersey untuk Sepeda Anak Yatim
              </h3>
            </div>
          </div>
          <div className="self-start sm:self-auto bg-brand-yellow/20 px-3 py-1 rounded-full border border-brand-yellow/40 text-brand-yellow font-mono text-xs font-black">
            {percentage}% TERCAPAI
          </div>
        </div>

        {/* Progress Bar Display */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-xs sm:text-sm">
            <span className="font-extrabold text-slate-200">
              Terkumpul: <strong className="text-brand-yellow text-base sm:text-lg font-mono font-black">{currentCount}</strong> / {targetCount} Jersey
            </span>
            <span className="text-slate-300 text-xs">
              {remaining > 0 ? (
                <>Kurang <strong className="text-brand-yellow font-bold">{remaining}</strong> jersey lagi</>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Target 100 Jersey Tercapai!</span>
                </span>
              )}
            </span>
          </div>

          {/* Animated Bar Container */}
          <div className="relative w-full h-4 sm:h-5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-sky-400/40 shadow-inner">
            <div
              className="h-full rounded-full bg-brand-sky shadow-[0_0_18px_rgba(56,189,248,1),0_0_30px_rgba(14,165,233,0.7)] transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${Math.max(5, percentage)}%` }}
            >
              {/* Inner light pulse & continuous shimmer beam */}
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
              
              {/* Leading edge neon spark */}
              <div className="absolute top-0 right-0 bottom-0 w-2.5 bg-white rounded-r-full shadow-[0_0_10px_#ffffff]" />
            </div>
          </div>
        </div>

        {/* Impact Story & CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-300 leading-relaxed text-center sm:text-left flex-1">
            <strong className="text-white">100% keuntungan bersih</strong> dari pembelian Jersey disalurkan utuh oleh pergerakan <strong className="text-brand-yellow">PEADERAL</strong> dalam wujud unit sepeda bagi anak yatim/piatu &amp; dhuafa.
          </p>
          <Link
            href="/daftar"
            className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-brand-yellow to-amber-400 hover:from-amber-300 hover:to-brand-yellow text-brand-navy font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-glow hover:scale-105 transition-all flex items-center justify-center space-x-1.5"
          >
            <Bike className="w-4 h-4" />
            <span>Ikut PO Jersey &amp; Donasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
