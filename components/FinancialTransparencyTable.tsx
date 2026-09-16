'use client';

import React, { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Wallet,
  Eye,
  X,
  FileCheck,
  Receipt,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck
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
    switch (kategori) {
      case 'produksi':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'logistik':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'konsumsi':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'operasional':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-brand-sky/30 shadow-card relative overflow-hidden space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Transparansi Kas Acara (LIVE)</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-navy font-display leading-tight">
            Laporan Keuangan Sementara
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Arus dana transparan dari pre-order jersey amal &amp; rekap pengeluaran operasional resmi Tour De Gunung Batu 2026.
          </p>
        </div>

        <button
          onClick={fetchFinance}
          disabled={loading}
          className="self-start md:self-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          title="Perbarui data keuangan"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-royal' : ''}`} />
          <span>{loading ? 'Memuat...' : 'Refresh Kas'}</span>
        </button>
      </div>

      {/* 3 Main KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Pemasukan Riil */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-700">
              Total Pemasukan (Lunas)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-900 font-display block mt-1.5">
            Rp {data.total_pemasukan_lunas.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
            Dari {data.total_qty_jersey_lunas} pcs PO Jersey Terverifikasi
          </span>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-4 sm:p-5 rounded-2xl border border-rose-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-rose-700">
              Total Pengeluaran Riil
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-700 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-rose-900 font-display block mt-1.5">
            Rp {data.total_pengeluaran.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] font-bold text-rose-700 block mt-0.5">
            {data.expenses.length} Pos Pengeluaran Dicatat
          </span>
        </div>

        {/* Saldo Kas Acara */}
        <div className="bg-gradient-to-br from-brand-navy to-brand-royalDark p-4 sm:p-5 rounded-2xl border border-white/15 text-white shadow-glow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-brand-yellow">
              Sisa Saldo Kas Acara
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/10 text-brand-yellow flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-brand-yellow font-display block mt-1.5">
            Rp {data.saldo_kas.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-slate-300 block mt-0.5">
            100% Saldo Kas Dipakai Demi Kelancaran Acara &amp; Amal
          </span>
        </div>
      </div>

      {/* Tabel Transparansi Pengeluaran */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-brand-navy flex items-center space-x-1.5">
            <Receipt className="w-4 h-4 text-brand-royal" />
            <span>Rincian Pengeluaran Acara &amp; Bukti Pembayaran</span>
          </h4>
          <span className="text-xs font-bold text-slate-400">
            {data.expenses.length} Catatan
          </span>
        </div>

        {data.expenses.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-400 text-xs font-medium space-y-1">
            <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">Belum ada pengeluaran yang dicatat panitia.</p>
            <p className="text-[11px]">Seluruh pengeluaran operasional akan dicantumkan di sini lengkap dengan nota/kuitansi.</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-3">
              {data.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 border-b pb-2">
                    <div>
                      <span className="font-extrabold text-xs text-brand-navy block">
                        {exp.deskripsi}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {exp.tanggal}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getKategoriBadge(
                        exp.kategori
                      )}`}
                    >
                      {exp.kategori || 'operasional'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {exp.qty}x @ Rp {exp.harga_satuan.toLocaleString('id-ID')}
                    </span>
                    <span className="font-black text-rose-600 font-mono text-sm">
                      Rp {exp.harga_total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="pt-2 border-t flex justify-end">
                    {exp.bukti_url ? (
                      <button
                        onClick={() =>
                          setActiveProofImage({
                            url: exp.bukti_url!,
                            title: exp.deskripsi,
                            total: exp.harga_total
                          })
                        }
                        className="px-3 py-1.5 rounded-xl bg-brand-royal/10 hover:bg-brand-royal/20 text-brand-royal font-bold text-xs flex items-center space-x-1.5 border border-brand-royal/30 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Bukti Nota</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Bukti struk fisik</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-navy text-white uppercase text-[11px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Deskripsi Pengeluaran</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Harga Satuan</th>
                    <th className="py-3 px-4 text-right">Total Nominal</th>
                    <th className="py-3 px-4 text-center">Bukti Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {data.expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {exp.tanggal}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-brand-navy">
                        {exp.deskripsi}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getKategoriBadge(
                            exp.kategori
                          )}`}
                        >
                          {exp.kategori || 'operasional'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-600">
                        {exp.qty}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        Rp {exp.harga_satuan.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-rose-600 text-sm">
                        Rp {exp.harga_total.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {exp.bukti_url ? (
                          <button
                            onClick={() =>
                              setActiveProofImage({
                                url: exp.bukti_url!,
                                title: exp.deskripsi,
                                total: exp.harga_total
                              })
                            }
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-brand-royal/10 hover:bg-brand-royal/20 text-brand-royal font-bold text-xs border border-brand-royal/30 transition-all cursor-pointer"
                            title="Klik untuk membuka bukti nota"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Bukti</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Nota fisik</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Popup Bukti Pembayaran / Nota */}
      {activeProofImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Bukti Pembayaran / Nota Resmi
                </span>
                <h4 className="font-extrabold text-base text-brand-navy mt-0.5">
                  {activeProofImage.title}
                </h4>
                <span className="text-xs font-mono font-bold text-rose-600 block mt-0.5">
                  Nominal: Rp {activeProofImage.total.toLocaleString('id-ID')}
                </span>
              </div>
              <button
                onClick={() => setActiveProofImage(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-2 flex items-center justify-center max-h-[60vh] overflow-auto border border-slate-200">
              {activeProofImage.url.startsWith('http') || activeProofImage.url.startsWith('data:') ? (
                <img
                  src={activeProofImage.url}
                  alt={`Bukti ${activeProofImage.title}`}
                  className="max-w-full h-auto rounded-xl object-contain shadow-sm"
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

            <div className="flex items-center justify-between pt-2 border-t text-xs">
              <span className="text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Dokumentasi Transparan Panitia TDGB</span>
              </span>
              <button
                onClick={() => setActiveProofImage(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
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
