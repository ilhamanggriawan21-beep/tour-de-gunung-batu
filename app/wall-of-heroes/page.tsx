'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopoBackground from '@/components/TopoBackground';
import { Users, Shirt, Search, Trophy, ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';

export default function WallOfHeroesPage() {
  const [activeTab, setActiveTab] = useState<'peserta' | 'jersey'>('peserta');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    total_peserta: 0,
    total_partisipan_jersey: 0,
    peserta_terdaftar: [],
    partisipan_jersey: [],
    top_komunitas: []
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/wall-of-heroes')
      .then((res) => res.json())
      .then((d) => {
        setLoading(false);
        if (d.success) {
          setData(d);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredPeserta = data.peserta_terdaftar.filter((item: any) =>
    item.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    item.komunitas.toLowerCase().includes(search.toLowerCase())
  );

  const filteredJersey = data.partisipan_jersey.filter((item: any) =>
    item.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    item.komunitas.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative bg-brand-iceBg">
      <TopoBackground />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-brand-yellow font-bold text-xs uppercase bg-brand-navy px-4 py-1.5 rounded-full mb-3 shadow-glow">
            <Trophy className="w-4 h-4 text-brand-yellow" />
            <span>Wall of Heroes — Transparansi Publik</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-navy font-display">
            DAFTAR HEROES & PARTISIPAN AMAL
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2">
            Penghormatan kepada seluruh pesepeda dan donatur yang telah terdaftar & berpartisipasi dalam Tour de Gunung Batu 2026.
          </p>
        </div>

        {/* Counter Summary Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-brand-navy to-brand-royalDark p-6 rounded-3xl text-white shadow-glow border-2 border-brand-sky/30 text-center">
            <Users className="w-8 h-8 text-brand-sky mx-auto mb-2" />
            <span className="text-4xl font-black text-white font-display block">
              {loading ? '...' : data.total_peserta}
            </span>
            <span className="text-xs text-brand-sky uppercase tracking-wider font-bold block mt-1">
              Total Peserta Terdaftar
            </span>
          </div>

          <div className="bg-gradient-to-br from-brand-navy to-brand-royal p-6 rounded-3xl text-white shadow-glow border-2 border-brand-yellow text-center">
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

        {/* Controls: Search & Tabs */}
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

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama / komunitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-royal text-xs font-semibold"
            />
          </div>
        </div>

        {/* Legend Indicator */}
        {activeTab === 'peserta' && (
          <div className="flex items-center space-x-4 text-xs font-semibold px-2 text-slate-600">
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-brand-yellow border border-amber-500 mr-1.5" />
              <strong className="text-amber-700 mr-1">Warna Emas + Badge:</strong> Partisipan PO Jersey (Lunas)
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-brand-royal mr-1.5" />
              <strong className="text-brand-royal mr-1">Warna Biru:</strong> Peserta Event Saja
            </span>
          </div>
        )}

        {/* TAB CONTENT TABLES */}
        <div className="bg-white rounded-3xl border border-brand-sky/40 shadow-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Memuat data Wall of Heroes...</div>
          ) : activeTab === 'peserta' ? (
            /* TAB 1: ALL REGISTRANTS */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-brand-navy text-white text-xs uppercase font-extrabold tracking-wider">
                  <tr>
                    <th className="py-4 px-6">BIB</th>
                    <th className="py-4 px-6">Nama Peserta</th>
                    <th className="py-4 px-6">Komunitas / Team</th>
                    <th className="py-4 px-6 text-center">Status Donasi PO Jersey</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {filteredPeserta.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        Tidak ada data peserta ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredPeserta.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-mono text-slate-500 font-bold">#{p.nomor_bib}</td>
                        <td className="py-4 px-6">
                          <span className={`font-extrabold text-base ${p.is_jersey_lunas ? 'text-amber-600 font-display' : 'text-brand-royal'}`}>
                            {p.nama_lengkap}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {p.komunitas || 'Umum'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {p.is_jersey_lunas ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                              <Shirt className="w-3.5 h-3.5 mr-1 text-amber-600" />
                              Partisipan Jersey Amal (Lunas)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                              Peserta Event Saja
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* TAB 2: VERIFIED JERSEY SUPPORTERS ONLY */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-brand-navy text-white text-xs uppercase font-extrabold tracking-wider">
                  <tr>
                    <th className="py-4 px-6">BIB</th>
                    <th className="py-4 px-6">Nama Donatur / Partisipan</th>
                    <th className="py-4 px-6">Komunitas</th>
                    <th className="py-4 px-6 text-center">Spesifikasi Jersey</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {filteredJersey.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        Belum ada partisipan jersey yang terverifikasi Lunas.
                      </td>
                    </tr>
                  ) : (
                    filteredJersey.map((j: any) => (
                      <tr key={j.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-4 px-6 font-mono text-slate-500 font-bold">#{j.nomor_bib}</td>
                        <td className="py-4 px-6">
                          <span className="font-extrabold text-base text-amber-600 font-display flex items-center space-x-1.5">
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                            <span>{j.nama_lengkap}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {j.komunitas || 'Umum'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-brand-navy text-brand-yellow">
                            {j.jersey_spec_str}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SUSULAN PO JERSEY CTA BANNER (Epic F1 AC) */}
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
