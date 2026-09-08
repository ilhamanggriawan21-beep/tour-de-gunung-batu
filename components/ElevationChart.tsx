'use client';

import React, { useState } from 'react';
import { Mountain, TrendingUp, MapPin, Flag, Compass, Info, Award } from 'lucide-react';

interface Waypoint {
  km: number;
  elev: number;
  label: string;
  desc: string;
  gradient?: string;
  tag?: string;
  xPct: number; // 0 to 100
  yPct: number; // 0 to 100 (relative to chart height, 0 = top)
}

// Key checkpoints along the 22.6KM route from Tugu Tegar Beriman to Kaki Gn. Batu
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
  const [activePoint, setActivePoint] = useState<Waypoint>(WAYPOINTS[3]); // default to Kopi Catang as highlight

  // SVG dimensions for coordinate calculations
  // viewBox: 0 0 1000 320
  // X: 40 to 960 (representing KM 0 to 22.6)
  // Y: 290 (80m) to 40 (640m)
  const pathData = "M 40 286 " +
    "C 120 284, 180 280, 240 274 " +
    "S 340 260, 420 248 " +
    "S 500 230, 580 200 " +
    "S 660 160, 720 120 " +
    "S 800 80, 860 48 " +
    "L 960 38";

  const areaData = `${pathData} L 960 300 L 40 300 Z`;

  return (
    <div className="w-full bg-gradient-to-b from-brand-navy via-slate-900 to-brand-navy rounded-3xl p-4 sm:p-7 text-white border-2 border-brand-sky/30 shadow-2xl overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-royal/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-brand-yellow font-bold text-xs uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-brand-yellow" />
            <span>Interactive Route Profile</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-display text-white tracking-wide">
            PROFIL ELEVASI &amp; TANJAKAN RUTE
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Jonggol (87 mdpl) &rarr; Sukamakmur &rarr; Kaki Gunung Batu (632 mdpl)
          </p>
        </div>

        {/* Highlight Quick Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 font-semibold text-brand-sky flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" /> 22.6 KM Total
          </span>
          <span className="bg-brand-yellow/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-brand-yellow/30 font-bold text-brand-yellow flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5" /> +700m Gain
          </span>
          <span className="bg-rose-500/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-rose-500/30 font-bold text-rose-400 flex items-center gap-1.5">
            🔥 Max 16% Slope
          </span>
        </div>
      </div>

      {/* Active Waypoint Card Preview (interactive) */}
      <div className="mb-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition-all">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
            activePoint.tag === 'START' ? 'bg-emerald-500 text-white' :
            activePoint.tag === 'FINISH' ? 'bg-brand-yellow text-brand-navy' :
            activePoint.tag === 'WALL' ? 'bg-rose-500 text-white animate-pulse' :
            'bg-brand-royal text-white'
          }`}>
            {activePoint.tag ? activePoint.tag : `${activePoint.km}k`}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-extrabold text-sm sm:text-base text-white">{activePoint.label}</h4>
              <span className="text-[11px] font-bold text-brand-yellow px-2 py-0.5 rounded-md bg-brand-yellow/20">
                {activePoint.elev} mdpl
              </span>
              {activePoint.gradient && (
                <span className="text-[11px] font-bold text-rose-300 px-2 py-0.5 rounded-md bg-rose-500/20">
                  Kemiringan: {activePoint.gradient}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{activePoint.desc}</p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 sm:self-center">
          <span className="text-white font-bold">KM {activePoint.km.toFixed(1)}</span> / 22.6 KM
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative w-full aspect-[21/9] min-h-[190px] sm:min-h-[240px] select-none">
        <svg
          viewBox="0 0 1000 320"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Elevation gradient fill */}
            <linearGradient id="elevationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F4C716" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#2563EB" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0B1A30" stopOpacity="0.05" />
            </linearGradient>

            {/* Stroke gradient */}
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#60A5FA" />
              <stop offset="80%" stopColor="#F4C716" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>

            {/* Grid pattern */}
            <pattern id="gridPattern" width="100" height="60" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid background */}
          <rect x="30" y="20" width="940" height="280" fill="url(#gridPattern)" />

          {/* Y-axis labels & reference lines */}
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

          {/* Elevation Area Fill */}
          <path d={areaData} fill="url(#elevationGrad)" />

          {/* Elevation Profile Outline Line */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_8px_rgba(244,199,22,0.6)]"
          />

          {/* Interactive Checkpoint Markers */}
          {WAYPOINTS.map((wp, idx) => {
            const cx = 40 + (wp.xPct / 100) * 920;
            const cy = 40 + (wp.yPct / 100) * 245;
            const isSelected = activePoint.label === wp.label;

            return (
              <g
                key={idx}
                className="cursor-pointer group"
                onClick={() => setActivePoint(wp)}
              >
                {/* Vertical drop line to base */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx}
                  y2={285}
                  stroke={isSelected ? '#F4C716' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray={isSelected ? 'none' : '3 3'}
                />

                {/* Outer ping animation for active waypoint */}
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

                {/* Base node circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 8 : 5}
                  fill={isSelected ? '#F4C716' : '#FFFFFF'}
                  stroke="#0B1A30"
                  strokeWidth="2.5"
                  className="transition-all duration-200 group-hover:scale-125"
                />

                {/* Label on top of node */}
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

          {/* X Axis distance milestones */}
          <g className="text-[10px] font-semibold fill-slate-400">
            <text x="40" y="312" textAnchor="start">KM 0 (Start)</text>
            <text x="270" y="312" textAnchor="middle">KM 6</text>
            <text x="500" y="312" textAnchor="middle">KM 12</text>
            <text x="730" y="312" textAnchor="middle">KM 18</text>
            <text x="960" y="312" textAnchor="end">KM 22.6 (Finish)</text>
          </g>
        </svg>
      </div>

      {/* Waypoint selector chips for mobile tap convenience */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-brand-sky" /> Klik waypoint untuk cek rute:
          </span>
          <span className="text-[11px] text-brand-yellow font-bold">Total Elev Gain: ±700m</span>
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
  );
}
