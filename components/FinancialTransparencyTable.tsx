'use client';

import React, { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Wallet,
  Eye,
  X,
  Receipt,
  RefreshCw,
  Clock,
  ShieldCheck,
  Tag,
  AlertCircle
} from 'lucide-react';

interface PublicExpense {
  id: string;
  deskripsi: string;
  kategori?: string;
  qty: number;
  harga_satuan: number;
  harga_total: number;
  bukti_url?: string | null;
  tanggal: string;
  created_at: string;
}

interface FinanceData {
  total_pemasukan_lunas: number;
  total_qty_jersey_lunas: number;
  total_estimasi_pending?: number;
  total_qty_jersey_pending?: number;
  total_pengeluaran: number;
  saldo_kas: number;
  expenses: PublicExpense[];
}

export default function FinancialTransparencyTable({
  initialData
}: {
  initialData?: FinanceData;
}) {
  const [data, setData] = useState<FinanceData>(
    initialData || {
      total_pemasukan_lunas: 0,
      total_qty_jersey_lunas: 0,
      total_estimasi_pending: 0,
      total_qty_jersey_pending: 0,
      total_pengeluaran: 0,
      saldo_kas: 0,
      expenses: []
    }
  );
  const [loading, setLoading] = useState(false);
  const [activeProofImage, setActiveProofImage] = useState<{
    url: string;
    title: string;
    total: number;
    tanggal?: string;
    kategori?: string;
  } | null>(null);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finance?t=${Date.now()}`, { cache: 'no-store' });
      const d = await res.json();
      if (d.success) {
        setData({
          total_pemasukan_lunas: d.total_pemasukan_lunas || 0,
          total_qty_jersey_lunas: d.total_qty_jersey_lunas || 0,
          total_estimasi_pending: d.total_estimasi_pending || 0,
          total_qty_jersey_pending: d.total_qty_jersey_pending || 0,
          total_pengeluaran: d.total_pengeluaran || 0,
          saldo_kas: d.saldo_kas || 0,
          expenses: d.expenses || []
        });
      }
    } catch (err) {
      console.error('Failed fetching finance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchFinance();
    }
  }, [initialData]);

  const getKategoriBadge = (kategori?: string) => {
    const k = (kategori || '').toLowerCase();
    switch (k) {
      case 'jersey':
      case 'produksi':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'logistik':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'konsumsi':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'medis':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'perlengkapan':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'publikasi':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'operasional':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDateShort = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const formatDateFull = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 md:p-9 border border-brand-sky/30 shadow-card relative overflow-hidden space-y-5 sm:space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Transparansi Kas Acara (LIVE)</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-brand-navy font-display leading-tight">
            Laporan Keuangan Sementara
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 max-w-2xl">
            Arus dana transparan dari PO Jersey amal &amp; pencatatan pengeluaran operasional resmi Tour De Gunung Batu 2026.
          </p>
        </div>

        <button
          onClick={fetchFinance}
          disabled={loading}
          className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          title="Perbarui data keuangan"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-royal' : ''}`} />
          <span className="text-[11px] sm:text-xs">{loading ? 'Memuat...' : 'Refresh Kas'}</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards (2x2 di HP, 4 kolom di Laptop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
        {/* Pemasukan Riil */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-3 sm:p-4 rounded-2xl border border-emerald-200/80 shadow-xs relative flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700 leading-tight">
              Pemasukan (Lunas)
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <span className="text-sm sm:text-xl font-black text-emerald-900 font-mono block tracking-tight">
              Rp {data.total_pemasukan_lunas.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 block truncate mt-0.5">
              {data.total_qty_jersey_lunas} jersey lunas
            </span>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100/40 p-3 sm:p-4 rounded-2xl border border-rose-200/80 shadow-xs relative flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-rose-700 leading-tight">
              Pengeluaran Riil
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-500/10 text-rose-700 flex items-center justify-center font-bold">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <span className="text-sm sm:text-xl font-black text-rose-900 font-mono block tracking-tight">
              Rp {data.total_pengeluaran.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 block truncate mt-0.5">
              {data.expenses.length} pos belanja
            </span>
          </div>
        </div>

        {/* Saldo Kas Acara */}
        <div className="bg-gradient-to-br from-brand-navy to-brand-royalDark p-3 sm:p-4 rounded-2xl border border-white/15 text-white shadow-xs relative flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-brand-yellow leading-tight">
              Saldo Kas Bersih
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 text-brand-yellow flex items-center justify-center font-bold">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <span className={`text-sm sm:text-xl font-black font-mono block tracking-tight ${data.saldo_kas >= 0 ? 'text-brand-yellow' : 'text-rose-400'}`}>
              Rp {data.saldo_kas.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-300 block truncate mt-0.5">
              Dana efektif acara
            </span>
          </div>
        </div>

        {/* Estimasi PO Belum Bayar */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 p-3 sm:p-4 rounded-2xl border border-amber-200/80 shadow-xs relative flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-800 leading-tight">
              Estimasi Pending
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <span className="text-sm sm:text-xl font-black text-amber-800 font-mono block tracking-tight">
              Rp {(data.total_estimasi_pending || 0).toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 block truncate mt-0.5">
              *Belum masuk kas riil
            </span>
          </div>
        </div>
      </div>

      {/* Tabel Transparansi Pengeluaran (MOBILE-FIRST: Pas di layar HP tanpa scroll kesamping, Warna Selang-Seling) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-xs sm:text-sm text-brand-navy flex items-center space-x-1.5">
            <Receipt className="w-4 h-4 text-brand-royal" />
            <span>Rincian Buku Kas Pengeluaran</span>
          </h4>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {data.expenses.length} Transaksi
          </span>
        </div>

        {data.expenses.length === 0 ? (
          <div className="p-7 text-center bg-slate-50/80 rounded-2xl border border-slate-200/70 text-slate-400 text-xs font-medium space-y-1">
            <Coins className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p className="font-bold text-slate-600">Belum ada pengeluaran yang dicatat panitia.</p>
            <p className="text-[11px] text-slate-400">Seluruh pengeluaran operasional resmi akan tercantum di tabel ini lengkap dengan foto nota fisik.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 shadow-xs overflow-hidden bg-white">
            {/* 1. VERSI MOBILE (HP): 3 Kolom Ringkas, Pas 100% Layar HP, Tanpa Scroll Kesamping */}
            <div className="block sm:hidden">
              <table className="w-full text-left table-fixed border-collapse">
                <thead>
                  <tr className="bg-brand-navy text-white text-[10px] uppercase font-black tracking-wider border-b border-brand-navyLight">
                    <th className="py-2.5 px-2.5 w-[27%]">Tgl &amp; Kat</th>
                    <th className="py-2.5 px-2 w-[43%]">Uraian Kebutuhan</th>
                    <th className="py-2.5 px-2.5 w-[30%] text-right">Biaya / Bukti</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {data.expenses.map((exp, idx) => (
                    <tr
                      key={exp.id}
                      className={`transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/90'
                      } hover:bg-amber-50/40`}
                    >
                      {/* Kolom 1: Tanggal & Kategori */}
                      <td className="py-2.5 px-2.5 align-top">
                        <div className="font-mono text-[10px] font-bold text-slate-700 leading-tight">
                          {formatDateShort(exp.tanggal)}
                        </div>
                        <span
                          className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${getKategoriBadge(
                            exp.kategori
                          )}`}
                        >
                          {exp.kategori || 'umum'}
                        </span>
                      </td>

                      {/* Kolom 2: Uraian & Qty */}
                      <td className="py-2.5 px-2 align-top">
                        <div className="font-extrabold text-slate-900 text-[11px] leading-tight break-words">
                          {exp.deskripsi}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                          {exp.qty}x @ Rp {exp.harga_satuan.toLocaleString('id-ID')}
                        </div>
                      </td>

                      {/* Kolom 3: Total & Tombol Nota */}
                      <td className="py-2.5 px-2.5 align-top text-right">
                        <div className="font-mono font-black text-rose-600 text-[11px] leading-tight">
                          Rp {exp.harga_total.toLocaleString('id-ID')}
                        </div>
                        {exp.bukti_url ? (
                          <button
                            onClick={() =>
                              setActiveProofImage({
                                url: exp.bukti_url!,
                                title: exp.deskripsi,
                                total: exp.harga_total,
                                tanggal: exp.tanggal,
                                kategori: exp.kategori
                              })
                            }
                            className="mt-1 ml-auto inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-brand-royal text-white text-[9px] font-extrabold shadow-xs hover:bg-brand-royalDark transition-all cursor-pointer"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>Nota</span>
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-300 italic block mt-0.5">
                            Fisik
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-200 text-slate-700">
                    <td colSpan={2} className="py-2 px-2.5 text-right text-[10px] uppercase font-black">
                      Total Pengeluaran:
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono font-black text-rose-600 text-[11px]">
                      Rp {data.total_pengeluaran.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 2. VERSI DESKTOP & TABLET: Tabel Lengkap, Warna Selang-Seling (Zebra Striped) */}
            <div className="hidden sm:block">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-brand-navy text-white uppercase text-[10px] font-black tracking-wider">
                    <th className="py-3 px-3.5 w-10 text-center">No</th>
                    <th className="py-3 px-3.5">Tanggal</th>
                    <th className="py-3 px-4">Uraian Pengeluaran</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Harga Satuan</th>
                    <th className="py-3 px-4 text-right">Total Biaya</th>
                    <th className="py-3 px-4 text-center">Bukti Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {data.expenses.map((exp, idx) => (
                    <tr
                      key={exp.id}
                      className={`transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'
                      } hover:bg-amber-50/50`}
                    >
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                        {formatDateFull(exp.tanggal)}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-brand-navy">
                        {exp.deskripsi}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getKategoriBadge(
                            exp.kategori
                          )}`}
                        >
                          {exp.kategori || 'operasional'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-600">
                        {exp.qty}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                        Rp {exp.harga_satuan.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-rose-600 whitespace-nowrap text-xs">
                        Rp {exp.harga_total.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {exp.bukti_url ? (
                          <button
                            onClick={() =>
                              setActiveProofImage({
                                url: exp.bukti_url!,
                                title: exp.deskripsi,
                                total: exp.harga_total,
                                tanggal: exp.tanggal,
                                kategori: exp.kategori
                              })
                            }
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-brand-royal/10 hover:bg-brand-royal text-brand-royal hover:text-white font-bold text-[11px] border border-brand-royal/20 transition-all cursor-pointer"
                            title="Klik untuk membuka bukti nota belanja"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Nota</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Nota fisik</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-200">
                    <td colSpan={6} className="py-3 px-4 text-right uppercase text-[11px] text-slate-600 font-black">
                      Total Seluruh Pengeluaran Riil:
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono text-rose-600 text-sm whitespace-nowrap">
                      Rp {data.total_pengeluaran.toLocaleString('id-ID')}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Popup Bukti Pembayaran / Nota (Dioptimalkan untuk HP & Layar Penuh) */}
      {activeProofImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-3.5 shadow-2xl relative border border-brand-sky/40 my-auto">
            <div className="flex items-start justify-between border-b pb-2.5">
              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  Bukti Pembayaran / Nota Resmi
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-brand-navy mt-1">
                  {activeProofImage.title}
                </h4>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                  {activeProofImage.tanggal && <span>{formatDateFull(activeProofImage.tanggal)}</span>}
                  <span>•</span>
                  <span className="font-black text-rose-600">
                    Rp {activeProofImage.total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveProofImage(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/5 rounded-2xl p-1.5 flex items-center justify-center max-h-[58vh] overflow-auto border border-slate-200">
              {activeProofImage.url.startsWith('http') || activeProofImage.url.startsWith('data:') ? (
                <img
                  src={activeProofImage.url}
                  alt={`Bukti ${activeProofImage.title}`}
                  className="max-w-full h-auto max-h-[55vh] rounded-xl object-contain shadow-xs"
                />
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  <p className="font-bold mb-1">Tautan Bukti:</p>
                  <a
                    href={activeProofImage.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-royal underline break-all"
                  >
                    {activeProofImage.url}
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t text-xs">
              <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dokumentasi Panitia TDGB</span>
              </span>
              <button
                onClick={() => setActiveProofImage(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
