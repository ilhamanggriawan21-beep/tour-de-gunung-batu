'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import TopoBackground from '@/components/TopoBackground';
import { Users, Shirt, Search, Trophy, ShieldCheck, Heart, Award, ArrowRight, RefreshCw } from 'lucide-react';

export default function WallOfHeroesPage() {
  const [activeTab, setActiveTab] = useState<'peserta' | 'jersey'>('peserta');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<any>({
    total_peserta: 0,
    total_partisipan_jersey: 0,
    peserta_terdaftar: [],
    partisipan_jersey: [],
    top_komunitas: []
  });
  const [search, setSearch] = useState('');

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/wall-of-heroes?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const d = await res.json();
      if (d.success) {
        setData(d);
      }
    } catch (err) {
      console.error('Failed fetching Wall of Heroes:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh when tab gains focus
    const handleFocus = () => loadData(true);
    window.addEventListener('focus', handleFocus);

    // Silent background poll every 15 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 15000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [loadData]);

  const filteredPeserta = (data.peserta_terdaftar || []).filter((item: any) =>
    (item.nama_lengkap || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.komunitas || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredJersey = (data.partisipan_jersey || []).filter((item: any) =>
    (item.nama_lengkap || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.komunitas || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative bg-brand-iceBg">
      <TopoBackground />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-brand-yellow font-bold text-xs uppercase bg-brand-navy px-4 py-1.5 rounded-full mb-3 shadow-glow">
            <Trophy className="w-4 h-4 text-brand-yellow" />
            <span>Wall of Heroes — Transparansi Publik Real-Time</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-navy font-display">
            DAFTAR HEROES & PARTISIPAN AMAL
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2">
            Penghormatan kepada seluruh pesepeda dan donatur yang telah terdaftar &amp; berpartisipasi dalam Tour de Gunung Batu 2026.
          </p>
        </div>

        {/* Counter Summary Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-brand-navy to-brand-royalDark p-6 rounded-3xl text-white shadow-glow border-2 border-brand-sky/30 text-center relative overflow-hidden">
            <Users className="w-8 h-8 text-brand-sky mx-auto mb-2" />
            <span className="text-4xl font-black text-white font-display block">
              {loading ? '...' : data.total_peserta}
            </span>
            <span className="text-xs text-brand-sky uppercase tracking-wider font-bold block mt-1">
              Total Peserta Terdaftar
            </span>
          </div>

          <div className="bg-gradient-to-br from-brand-navy to-brand-royal p-6 rounded-3xl text-white shadow-glow border-2 border-brand-yellow text-center relative overflow-hidden">
            <Shirt className="w-8 h-8 text-brand-yellow mx-auto mb-2" />
            <span className="text-4xl font-black text-brand-yellow font-display block">
              {loading ? '...' : data.total_partisipan_jersey}
            </span>
            <span className="text-xs text-brand-yellow uppercase tracking-wider font-bold block mt-1">
              Total Partisipan Jersey (Lunas)
            </span>
          </div>
        </div>

        {/* Community Leaderboard Preview */}
        {data.top_komunitas && data.top_komunitas.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-brand-sky/30 shadow-card">
            <div className="flex items-center space-x-2 text-brand-navy font-extrabold text-sm uppercase mb-4">
              <Award className="w-5 h-5 text-brand-yellow" />
              <span>Mini Leaderboard — Komunitas Peserta Terbanyak</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {data.top_komunitas.map((kom: any, idx: number) => (
                <div key={idx} className="bg-brand-iceBg p-3 rounded-2xl border border-brand-sky/20 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block font-mono">#{idx + 1}</span>
                  <span className="font-extrabold text-sm text-brand-navy block truncate">{kom.nama}</span>
                  <span className="text-xs font-semibold text-brand-royal block">{kom.jumlah} Peserta</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls: Search & Tabs & Refresh */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-brand-sky/30 shadow-card">
          {/* Tabs */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('peserta')}
              className={`flex-1 md:flex-none px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'peserta'
                  ? 'bg-brand-navy text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Peserta Terdaftar ({data.total_peserta})</span>
            </button>

            <button
              onClick={() => setActiveTab('jersey')}
              className={`flex-1 md:flex-none px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'jersey'
                  ? 'bg-brand-yellow text-brand-navy shadow-glow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Shirt className="w-4 h-4 text-brand-navy" />
              <span>Partisipan Jersey ({data.total_partisipan_jersey})</span>
            </button>
          </div>

          {/* Search Box & Refresh Button */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama / komunitas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-royal text-xs font-semibold"
              />
            </div>
            <button
              onClick={() => loadData(false)}
              disabled={isRefreshing}
              title="Segarkan data terbaru"
              className="p-2.5 bg-slate-100 hover:bg-brand-sky/20 rounded-2xl text-slate-600 hover:text-brand-royal transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-royal' : ''}`} />
            </button>
          </div>
        </div>

        {/* Legend Indicator */}
        {activeTab === 'peserta' && (
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold px-2 text-slate-600">
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-brand-yellow border border-amber-500 mr-1.5" />
              <strong className="text-amber-800 mr-1">Warna Emas:</strong> Partisipan PO Jersey (Lunas)
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-amber-200 border border-amber-400 mr-1.5" />
              <strong className="text-amber-700 mr-1">Warna Amber:</strong> PO Jersey (Menunggu Verifikasi)
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-brand-royal mr-1.5" />
              <strong className="text-brand-royal mr-1">Warna Biru:</strong> Peserta Event Saja
            </span>
          </div>
        )}

        {/* TAB CONTENT — Compact Card Row (mobile-first, no horizontal scroll) */}
        <div className="bg-white rounded-3xl border border-brand-sky/40 shadow-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-royal mx-auto mb-2" />
              Memuat data Wall of Heroes...
            </div>
          ) : activeTab === 'peserta' ? (
            /* TAB 1: ALL REGISTRANTS — Compact Card Row */
            <div className="divide-y divide-slate-100">
              {filteredPeserta.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Tidak ada data peserta ditemukan.
                </div>
              ) : (
                filteredPeserta.map((p: any) => {
                  const isJerseyLunas = p.is_jersey_lunas;
                  const isPo = p.jenis_registrasi === 'po_jersey';
                  const bibBg = isJerseyLunas
                    ? 'bg-amber-500 text-white'
                    : isPo
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-brand-royal text-white';
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isJerseyLunas ? 'hover:bg-amber-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* BIB Circle */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-xs ${bibBg}`}>
                        {p.nomor_bib}
                      </div>

                      {/* Name + Komunitas */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm leading-tight truncate ${
                          isJerseyLunas ? 'text-amber-600' : isPo ? 'text-amber-700' : 'text-brand-navy'
                        }`}>
                          {p.nama_lengkap}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {p.komunitas || 'Umum'}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {isJerseyLunas ? (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
                          <Shirt className="w-3 h-3" />
                          <span className="hidden sm:inline">Jersey Lunas</span>
                          <span className="sm:hidden">✓</span>
                        </span>
                      ) : isPo ? (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                          <Shirt className="w-3 h-3" />
                          <span className="hidden sm:inline">Menunggu</span>
                          <span className="sm:hidden">⏳</span>
                        </span>
                      ) : (
                        <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 whitespace-nowrap">
                          <span className="hidden sm:inline">Peserta</span>
                          <span className="sm:hidden">—</span>
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* TAB 2: VERIFIED JERSEY SUPPORTERS — Compact Card Row */
            <div className="divide-y divide-slate-100">
              {filteredJersey.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Belum ada partisipan jersey yang terverifikasi Lunas.
                </div>
              ) : (
                filteredJersey.map((j: any) => (
                  <div
                    key={j.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50/50 transition-colors"
                  >
                    {/* BIB Circle — gold for jersey supporters */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-xs bg-amber-500 text-white">
                      {j.nomor_bib}
                    </div>

                    {/* Name + Komunitas */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm leading-tight truncate text-amber-600 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500 flex-shrink-0" />
                        <span className="truncate">{j.nama_lengkap}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {j.komunitas || 'Umum'}
                      </p>
                    </div>

                    {/* Jersey Spec Badge */}
                    <span className="flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-extrabold bg-brand-navy text-brand-yellow text-center leading-tight whitespace-normal text-right">
                      {j.jersey_spec_str}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* SUSULAN PO JERSEY CTA BANNER */}
        <div className="bg-gradient-to-r from-brand-royalDark to-brand-navy rounded-3xl p-6 sm:p-8 text-white border border-brand-yellow/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-glow">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-extrabold text-brand-yellow font-display">
              Sudah daftar tapi belum ikut PO Jersey?
            </h3>
            <p className="text-xs sm:text-sm text-brand-sky/80">
              Nama Anda bisa tampil dengan warna emas di sini! Ikut PO Jersey amal sekarang tanpa isi ulang data pribadi.
            </p>
          </div>
          <Link
            href="/susulan-po"
            className="whitespace-nowrap bg-brand-yellow hover:bg-amber-400 text-brand-navy font-bold px-6 py-3 rounded-xl transition-all text-xs sm:text-sm flex items-center space-x-2 shadow-md w-full sm:w-auto justify-center"
          >
            <span>Susulan PO di Sini</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
