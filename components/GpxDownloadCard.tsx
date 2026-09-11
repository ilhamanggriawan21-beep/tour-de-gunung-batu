'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Download, Compass, Sparkles, AlertCircle, Clock, MapPin } from 'lucide-react';

interface GpxDownloadCardProps {
  targetDateStr?: string;
}

export default function GpxDownloadCard({
  targetDateStr = '2026-09-26T00:00:00+07:00'
}: GpxDownloadCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [devBypass, setDevBypass] = useState(false);

  useEffect(() => {
    // Check url search params for test mode
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('test_gpx') === 'true') {
        setDevBypass(true);
      }
    }

    const targetTime = new Date(targetDateStr).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setIsUnlocked(true);
        setTimeLeft(null);
      } else {
        setIsUnlocked(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  const activeUnlocked = isUnlocked || devBypass;

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-brand-yellow/60 bg-gradient-to-br from-brand-navy via-brand-navyLight to-brand-royalDark text-white p-5 sm:p-7 shadow-glow">
      {/* Top Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-4 mb-5">
        <div className="inline-flex items-center space-x-2 bg-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-brand-yellow/40">
          <Compass className="w-4 h-4" />
          <span>Navigasi Jalur &amp; Rute Resmi</span>
        </div>
        <span className="text-[11px] text-brand-sky/80 font-mono font-bold">
          ±60 KM PP • EG ±1000m+
        </span>
      </div>

      {!activeUnlocked ? (
        <div className="space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-brand-yellow flex items-center justify-center border border-brand-yellow/30 flex-shrink-0 shadow-inner">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-display">
                🔒 Jalur Rute Masih Dirahasiakan! <span className="text-brand-yellow">(Surprise Route)</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                Karakter khas <strong>Tour de Gunung Batu</strong>: jalur "lucu" dan seru sengaja dirahasiakan agar tetap steril dan penuh kejutan. File GPX resmi akan <strong>otomatis terbuka tepat H-1 (Sabtu, 26 September 2026, 00.00 WIB)</strong>.
              </p>
            </div>
          </div>

          {/* Countdown to H-1 Unlock */}
          {timeLeft && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/15 text-center">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase text-brand-yellow tracking-widest block mb-2">
                Hitung Mundur Pembukaan Jalur GPX (H-1):
              </span>
              <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto font-mono text-center">
                <div className="bg-black/30 rounded-xl p-2 border border-white/10">
                  <span className="text-lg sm:text-2xl font-black text-white block">{timeLeft.days}</span>
                  <span className="text-[9px] uppercase text-brand-sky font-bold">Hari</span>
                </div>
                <div className="bg-black/30 rounded-xl p-2 border border-white/10">
                  <span className="text-lg sm:text-2xl font-black text-white block">{timeLeft.hours}</span>
                  <span className="text-[9px] uppercase text-brand-sky font-bold">Jam</span>
                </div>
                <div className="bg-black/30 rounded-xl p-2 border border-white/10">
                  <span className="text-lg sm:text-2xl font-black text-white block">{timeLeft.minutes}</span>
                  <span className="text-[9px] uppercase text-brand-sky font-bold">Menit</span>
                </div>
                <div className="bg-black/30 rounded-xl p-2 border border-white/10">
                  <span className="text-lg sm:text-2xl font-black text-brand-yellow block">{timeLeft.seconds}</span>
                  <span className="text-[9px] uppercase text-brand-sky font-bold">Detik</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Titik Kumpul: Tugu Tegar Beriman Jonggol (On Saddle 07.30 WIB)</span>
            </span>
            <button
              type="button"
              onClick={() => setDevBypass(true)}
              className="text-[10px] text-white/40 hover:text-white underline self-end sm:self-auto"
              title="Khusus Pengetesan Localhost"
            >
              [Simulasi Buka GPX]
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/40 flex-shrink-0 shadow-inner">
              <Unlock className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1 text-emerald-400 font-bold text-xs uppercase mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rute Resmi Telah Dibuka!</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-display">
                Download File GPX Tour de Gunung Batu 2026
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                Jalur telah dibuka! Silakan unduh file GPX di bawah ini untuk dimasukkan ke perangkat <strong>Garmin, Wahoo, Bryton, Hammerhead, Komoot, atau aplikasi GPX Viewer di HP</strong> Anda.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a
              href="/api/gpx?test=true"
              download="Tour_de_Gunung_Batu_2026.gpx"
              className="flex-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center space-x-2.5"
            >
              <Download className="w-5 h-5" />
              <span>DOWNLOAD FILE GPX RESMI (.GPX)</span>
            </a>
            {devBypass && !isUnlocked && (
              <button
                onClick={() => setDevBypass(false)}
                className="px-3 py-2 text-[10px] text-amber-300 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 font-mono"
              >
                Kembali ke Mode Kunci
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
