'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Shirt, UserCheck } from 'lucide-react';

interface CountdownProps {
  poDeadlineStr?: string;
  regDeadlineStr?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeLeft(targetDateStr: string): TimeLeft {
  const diff = new Date(targetDateStr).getTime() - new Date().getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isExpired: false,
  };
}

export default function CountdownTimer({
  poDeadlineStr = '2026-09-20T23:59:59',
  regDeadlineStr = '2026-09-25T23:59:59',
}: CountdownProps) {
  const [poTime, setPoTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  const [regTime, setRegTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPoTime(calculateTimeLeft(poDeadlineStr));
    setRegTime(calculateTimeLeft(regDeadlineStr));

    const timer = setInterval(() => {
      setPoTime(calculateTimeLeft(poDeadlineStr));
      setRegTime(calculateTimeLeft(regDeadlineStr));
    }, 1000);

    return () => clearInterval(timer);
  }, [poDeadlineStr, regDeadlineStr]);

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {/* PO Jersey Countdown Card */}
      <div className="bg-gradient-to-br from-brand-navy to-brand-royalDark p-5 rounded-2xl border-2 border-brand-yellow/60 shadow-glow relative overflow-hidden">
        <div className="flex items-center space-x-2 text-brand-yellow mb-3">
          <Shirt className="w-5 h-5" />
          <span className="font-bold uppercase tracking-wider text-xs sm:text-sm">Tutup Pre-Order (PO) Jersey</span>
        </div>
        {poTime.isExpired ? (
          <div className="bg-amber-500/20 border border-amber-500/50 text-amber-300 text-sm font-semibold p-3 rounded-xl text-center">
            PO Jersey telah ditutup untuk keperluan produksi.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">{poTime.days}</span>
              <span className="text-[10px] text-brand-sky uppercase font-semibold">Hari</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">{poTime.hours}</span>
              <span className="text-[10px] text-brand-sky uppercase font-semibold">Jam</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">{poTime.minutes}</span>
              <span className="text-[10px] text-brand-sky uppercase font-semibold">Menit</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-yellow block">{poTime.seconds}</span>
              <span className="text-[10px] text-brand-yellow uppercase font-semibold">Detik</span>
            </div>
          </div>
        )}
        <p className="text-[11px] text-brand-sky/80 mt-3 text-center">Tenggat PO: 20 September 2026 23:59 WIB</p>
      </div>

      {/* Registration Countdown Card */}
      <div className="bg-gradient-to-br from-brand-royalDark to-brand-navy p-5 rounded-2xl border border-brand-sky/30 shadow-card relative overflow-hidden">
        <div className="flex items-center space-x-2 text-brand-sky mb-3">
          <UserCheck className="w-5 h-5 text-brand-sky" />
          <span className="font-bold uppercase tracking-wider text-xs sm:text-sm text-white">Tutup Pendaftaran Event</span>
        </div>
        {regTime.isExpired ? (
          <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 text-sm font-semibold p-3 rounded-xl text-center">
            Pendaftaran event telah resmi ditutup.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">{regTime.days}</span>
              <span className="text-[10px] text-brand-sky uppercase font-semibold">Hari</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">{regTime.hours}</span>
              <span className="text-[10px] text-brand-sky uppercase font-semibold">Jam</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">{regTime.minutes}</span>
              <span className="text-[10px] text-brand-sky uppercase font-semibold">Menit</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-sky block">{regTime.seconds}</span>
              <span className="text-[10px] text-brand-sky uppercase font-semibold">Detik</span>
            </div>
          </div>
        )}
        <p className="text-[11px] text-brand-sky/80 mt-3 text-center">Tenggat Event: 25 September 2026 23:59 WIB</p>
      </div>
    </div>
  );
}
