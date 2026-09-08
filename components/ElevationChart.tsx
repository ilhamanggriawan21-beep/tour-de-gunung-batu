'use client';

import React, { useState } from 'react';
import { Mountain, TrendingUp, MapPin, Compass, Info, Award, ShieldCheck } from 'lucide-react';

interface Waypoint {
  km: number;
  elev: number;
  label: string;
  desc: string;
  gradient?: string;
  tag?: string;
  xPct: number;
  yPct: number;
}

const WAYPOINTS: Waypoint[] = [
  {
    km: 0.0,
    elev: 87,
    label: 'Tugu Tegar Beriman',
    desc: 'Titik Start & Roll Out 07.30 WIB',
    gradient: '1%',
    tag: 'START',
    xPct: 5,
    yPct: 86
  },
  {
    km: 7.2,
    elev: 135,
    label: 'Jembatan Cipamingkis',
    desc: 'Jalur aspal rolling hangat & pemanasan',
    gradient: '3%',
    xPct: 32,
    yPct: 78
  },
  {
    km: 13.8,
    elev: 285,
    label: 'Gerbang Sukamakmur',
    desc: 'Mulai masuk kontur perbukitan & tanjakan konsisten',
    gradient: '7%',
    tag: 'CLIMB',
    xPct: 61,
    yPct: 54
  },
  {
    km: 18.5,
    elev: 490,
    label: 'Tanjakan Kopi Catang',
    desc: 'Sektor tanjakan paling curam, uji ketahanan mental',
    gradient: '16%',
    tag: 'WALL',
    xPct: 82,
    yPct: 24
  },
  {
    km: 22.6,
    elev: 632,
    label: 'Kaki Gunung Batu',
    desc: 'Finish Line, Serah Terima Donasi & Foto Bersama',
    gradient: '9%',
    tag: 'FINISH',
    xPct: 96,
    yPct: 8
  }
];

export default function ElevationChart() {
  const [activePoint, setActivePoint] = useState<Waypoint>(WAYPOINTS[3]);

  const pathData =
    "M 40 286 " +
    "C 120 284, 180 280, 240 274 " +
    "S 340 260, 420 248 " +
    "S 500 230, 580 200 " +
    "S 660 160, 720 120 " +
    "S 800 80, 860 48 " +
    "L 960 38";

  const areaData = `${pathData} L 960 300 L 40 300 Z`;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-brand-sky/30 shadow-card relative overflow-hidden">
      {/* Header Section (Unified with Original Design) */}
      <div className="text-center max-w-2xl sm:max-w-3xl mx-auto mb-6 sm:mb-8 space-y-2 sm:space-y-3">
        <div className="inline-flex items-center space-x-2 text-brand-royal font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-brand-royal/10 px-3 py-1 rounded-full">
          <Mountain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-royal" />
          <span>Profil Rute &amp; Elevasi</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy font-display leading-tight">
          Profil Elevasi Rute 22.6 KM
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed px-2">
          Jonggol (87 mdpl) menanjak menuju Kaki Gunung Batu (632 mdpl). Total elevation gain ±700m dengan sektor tanjakan ikonik hingga 16%.
        </p>
      </div>

      {/* Signature Blue-Navy Glow Frame (Same Frame as Official Jersey Display) */}
      <div className="relative max-w-4xl mx-auto bg-gradient-to-b from-brand-navy via-brand-navyLight to-brand-royalDark p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-brand-yellow/70 shadow-glow mb-6 sm:mb-8 overflow-hidden text-white">
        
        {/* Frame Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-white text-[10px] sm:text-xs font-bold mb-3 px-1 gap-2">
          <span className="text-brand-yellow uppercase tracking-wider flex items-center">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-brand-yellow" />
            GRAFIK TANJAKAN STRATA JALUR RESMI
          </span>
          <div className="flex items-center gap-1.5">
            <span className="bg-white/10 text-brand-sky px-2.5 py-0.5 rounded-full border border-white/15 text-[10px] sm:text-[11px]">
              Tugu Tegar Beriman &rarr; Gn. Batu
            </span>
          </div>
        </div>

        {/* Active Waypoint Info Banner */}
        <div className="mb-4 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition-all">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm flex-shrink-0 ${
                activePoint.tag === 'START'
                  ? 'bg-emerald-500 text-white'
                  : activePoint.tag === 'FINISH'
                  ? 'bg-brand-yellow text-brand-navy'
                  : activePoint.tag === 'WALL'
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-brand-royal text-white'
              }`}
            >
              {activePoint.tag ? activePoint.tag : `${activePoint.km}k`}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h4 className="font-extrabold text-sm sm:text-base text-white">{activePoint.label}</h4>
                <span className="text-[10px] sm:text-xs font-bold text-brand-yellow px-2 py-0.5 rounded-md bg-brand-yellow/20">
                  {activePoint.elev} mdpl
                </span>
                {activePoint.gradient && (
                  <span className="text-[10px] sm:text-xs font-bold text-rose-300 px-2 py-0.5 rounded-md bg-rose-500/20">
                    Gradien: {activePoint.gradient}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">{activePoint.desc}</p>
            </div>
          </div>

          <div className="text-right text-[11px] sm:text-xs text-slate-400 sm:self-center">
            <span className="text-white font-bold">KM {activePoint.km.toFixed(1)}</span> / 22.6 KM
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="relative w-full aspect-[21/9] min-h-[180px] sm:min-h-[230px] select-none">
          <svg viewBox="0 0 1000 320" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="elevationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F4C716" stopOpacity="0.75" />
                <stop offset="45%" stopColor="#2563EB" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#0A1338" stopOpacity="0.05" />
              </linearGradient>

              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#60A5FA" />
                <stop offset="80%" stopColor="#F4C716" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>

              <pattern id="gridPattern" width="100" height="60" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Grid */}
            <rect x="30" y="20" width="940" height="280" fill="url(#gridPattern)" />

            {/* Y axis */}
            <g className="text-[11px] font-mono fill-slate-400">
              <line x1="40" y1="40" x2="970" y2="40" stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
              <text x="10" y="44" className="text-[10px] fill-brand-yellow font-bold">650m</text>

              <line x1="40" y1="120" x2="970" y2="120" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <text x="10" y="124" className="text-[10px]">500m</text>

              <line x1="40" y1="200" x2="970" y2="200" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <text x="10" y="204" className="text-[10px]">300m</text>

              <line x1="40" y1="285" x2="970" y2="285" stroke="rgba(255,255,255,0.15)" />
              <text x="10" y="289" className="text-[10px]">80m</text>
            </g>

            {/* Area & Stroke */}
            <path d={areaData} fill="url(#elevationGrad)" />
            <path
              d={pathData}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              className="filter drop-shadow-[0_0_8px_rgba(244,199,22,0.6)]"
            />

            {/* Checkpoint Markers */}
            {WAYPOINTS.map((wp, idx) => {
              const cx = 40 + (wp.xPct / 100) * 920;
              const cy = 40 + (wp.yPct / 100) * 245;
              const isSelected = activePoint.label === wp.label;

              return (
                <g key={idx} className="cursor-pointer group" onClick={() => setActivePoint(wp)}>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={cx}
                    y2={285}
                    stroke={isSelected ? '#F4C716' : 'rgba(255,255,255,0.2)'}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray={isSelected ? 'none' : '3 3'}
                  />

                  {isSelected && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="14"
                      fill="none"
                      stroke="#F4C716"
                      strokeWidth="2"
                      className="animate-ping opacity-75"
                    />
                  )}

                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 8 : 5}
                    fill={isSelected ? '#F4C716' : '#FFFFFF'}
                    stroke="#0A1338"
                    strokeWidth="2.5"
                    className="transition-all duration-200 group-hover:scale-125"
                  />

                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    className={`text-[11px] font-bold ${
                      isSelected ? 'fill-brand-yellow font-black text-[13px]' : 'fill-white/80'
                    }`}
                  >
                    {wp.elev}m
                  </text>
                </g>
              );
            })}

            {/* X axis */}
            <g className="text-[10px] font-semibold fill-slate-400">
              <text x="40" y="312" textAnchor="start">KM 0 (Start)</text>
              <text x="270" y="312" textAnchor="middle">KM 6</text>
              <text x="500" y="312" textAnchor="middle">KM 12</text>
              <text x="730" y="312" textAnchor="middle">KM 18</text>
              <text x="960" y="312" textAnchor="end">KM 22.6 (Finish)</text>
            </g>
          </svg>
        </div>

        {/* Waypoint Quick Selector Chips */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-brand-sky" /> Klik waypoint untuk melihat segmen rute:
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {WAYPOINTS.map((wp, idx) => (
              <button
                key={idx}
                onClick={() => setActivePoint(wp)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activePoint.label === wp.label
                    ? 'bg-brand-yellow text-brand-navy shadow-md scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
              >
                KM {wp.km.toFixed(1)}: {wp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Key Stats Pills in Ice Background (matching the site's Guarantees & Stats style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
        <div className="p-4 bg-brand-iceBg rounded-xl sm:rounded-2xl border border-brand-sky/30 text-center">
          <div className="text-brand-royal font-bold text-xs uppercase tracking-wider mb-0.5">Jarak Tempuh</div>
          <div className="text-2xl font-black text-brand-navy font-display">±22,6 KM</div>
          <div className="text-[11px] text-slate-500 mt-1">Start Tugu Tegar Beriman &rarr; Finish Kaki Gn. Batu</div>
        </div>

        <div className="p-4 bg-brand-iceBg rounded-xl sm:rounded-2xl border border-brand-sky/30 text-center">
          <div className="text-brand-royal font-bold text-xs uppercase tracking-wider mb-0.5">Elevation Gain</div>
          <div className="text-2xl font-black text-brand-yellow font-display">±700 Meter</div>
          <div className="text-[11px] text-slate-500 mt-1">Dari 87 mdpl menanjak hingga 632 mdpl</div>
        </div>

        <div className="p-4 bg-brand-iceBg rounded-xl sm:rounded-2xl border border-brand-sky/30 text-center">
          <div className="text-rose-600 font-bold text-xs uppercase tracking-wider mb-0.5">Kemiringan Maksimal</div>
          <div className="text-2xl font-black text-rose-600 font-display">16% Slope</div>
          <div className="text-[11px] text-slate-500 mt-1">Sektor tanjakan curam di Kopi Catang</div>
        </div>
      </div>
    </div>
  );
}
