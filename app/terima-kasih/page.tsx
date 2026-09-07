'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TopoBackground from '@/components/TopoBackground';
import BibCard from '@/components/BibCard';
import { CheckCircle, Bike, Heart, ArrowRight, AlertCircle } from 'lucide-react';

function Content() {
  const searchParams = useSearchParams();
  const regCode = searchParams.get('code');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (regCode) {
      fetch(`/api/payment/status?code=${encodeURIComponent(regCode)}`)
        .then((res) => res.json())
        .then((d) => {
          setLoading(false);
          if (d.success) {
            setData(d);
          } else {
            setError(d.error || 'Data registrasi tidak ditemukan');
          }
        })
        .catch(() => {
          setLoading(false);
          setError('Gagal memuat data');
        });
    } else {
      setLoading(false);
    }
  }, [regCode]);

  if (loading) {
    return (
      <div className="min-h-screen py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-brand-royal border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-semibold">Memuat Kartu Registrasi & BIB...</p>
      </div>
    );
  }

  if (!regCode || error || !data) {
    return (
      <div className="min-h-screen py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-card border border-rose-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-slate-600 text-sm mb-6">Silakan daftar atau cari status registrasi Anda terlebih dahulu.</p>
          <Link href="/susulan-po" className="bg-brand-royal text-white px-6 py-2.5 rounded-xl text-sm font-bold">
            Cari Status Registrasi
          </Link>
        </div>
      </div>
    );
  }

  const { registrant, jersey_po } = data;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative bg-brand-iceBg">
      <TopoBackground />

      <div className="max-w-3xl mx-auto relative z-10 text-center space-y-6">
        {/* Top Success Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-sky/40 shadow-card">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-navy font-display mb-2">
            Terima Kasih, {registrant.nama_lengkap}!
          </h1>
          <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
            Pendaftaran Anda di event <strong className="text-brand-royal">Tour de Gunung Batu 2026</strong> telah tercatat resmi. Berikut adalah Nomor BIB Digital Anda.
          </p>

          {registrant.jenis_registrasi === 'po_jersey' && jersey_po?.status_pembayaran !== 'lunas' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center justify-between">
              <span>Pesanan PO Jersey Anda masih menunggu konfirmasi pembayaran.</span>
              <Link
                href={`/pembayaran/${registrant.nomor_registrasi}`}
                className="bg-brand-navy text-white font-bold px-3 py-1.5 rounded-lg ml-2 hover:bg-brand-royal"
              >
                Upload Bukti Transfer
              </Link>
            </div>
          )}

          {registrant.jenis_registrasi === 'daftar_saja' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-brand-navy to-brand-royal text-white rounded-2xl text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
              <div>
                <span className="font-extrabold text-brand-yellow block">Mau ikut donasi sepeda lewat PO Jersey Resmi?</span>
                <span className="text-brand-sky/80">Anda bisa menyusul pesan jersey amal kapan saja sebelum 20 September.</span>
              </div>
              <Link
                href="/susulan-po"
                className="bg-brand-yellow hover:bg-amber-400 text-brand-navy font-black px-4 py-2 rounded-xl whitespace-nowrap shadow-sm text-xs"
              >
                Susulan PO Jersey
              </Link>
            </div>
          )}
        </div>

        {/* Digital BIB Card Component */}
        <BibCard
          nomorBib={registrant.nomor_bib}
          namaLengkap={registrant.nama_lengkap}
          komunitas={registrant.komunitas}
          nomorRegistrasi={registrant.nomor_registrasi}
          jenisRegistrasi={registrant.jenis_registrasi}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/wall-of-heroes"
            className="w-full sm:w-auto bg-brand-royal hover:bg-brand-royalDark text-white font-bold px-6 py-3 rounded-xl shadow text-sm flex items-center justify-center space-x-2"
          >
            <span>Lihat Nama Anda di Wall of Heroes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/peraturan"
            className="w-full sm:w-auto bg-white text-slate-700 border border-slate-300 font-bold px-6 py-3 rounded-xl text-sm"
          >
            Baca Peraturan & Panduan Event
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TerimaKasihPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">Loading...</div>}>
      <Content />
    </Suspense>
  );
}
