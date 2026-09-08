'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TopoBackground from '@/components/TopoBackground';
import SizeChart from '@/components/SizeChart';
import { Bike, Shirt, Heart, ShieldCheck, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Ruler } from 'lucide-react';

function DaftarFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') === 'daftar_saja' ? 'daftar_saja' : 'po_jersey';

  const [settings, setSettings] = useState({
    harga_short_sleeve: 175000,
    harga_long_sleeve: 185000,
    tanggal_tutup_po: '2026-09-20T23:59:59',
    tanggal_tutup_pendaftaran: '2026-09-25T23:59:59'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPoClosed, setIsPoClosed] = useState(false);
  const [isRegClosed, setIsRegClosed] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    alamat_lengkap: '',
    no_telepon: '',
    no_telepon_kerabat: '',
    komunitas: '',
    jenis_registrasi: initialType as 'daftar_saja' | 'po_jersey',
    consent_data: false,
    consent_waiver: false,
    consent_no_refund: false,
    // Jersey specs
    jenis_lengan: 'short_sleeve' as 'short_sleeve' | 'long_sleeve',
    ukuran: 'L' as 'S' | 'M' | 'L' | 'XL' | 'XXL',
    qty: 1,
    metode_ambil: 'ambil_langsung' as 'ambil_langsung' | 'dikirim',
    alamat_pengiriman: ''
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
          const now = new Date();
          if (now > new Date(data.settings.tanggal_tutup_pendaftaran)) {
            setIsRegClosed(true);
          }
          if (now > new Date(data.settings.tanggal_tutup_po)) {
            setIsPoClosed(true);
            setFormData((prev) => ({ ...prev, jenis_registrasi: 'daftar_saja' }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const totalHarga =
    formData.jenis_registrasi === 'po_jersey'
      ? (formData.jenis_lengan === 'short_sleeve' ? settings.harga_short_sleeve : settings.harga_long_sleeve) *
        formData.qty
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nama_lengkap.trim() || !formData.no_telepon.trim()) {
      setError('Mohon lengkapi Nama Lengkap dan Nomor Telepon WhatsApp.');
      return;
    }

    if (!formData.alamat_lengkap.trim()) {
      setError(
        formData.jenis_registrasi === 'po_jersey'
          ? 'Mohon isi Alamat Lengkap untuk pengiriman jersey.'
          : 'Mohon isi Kota / Kabupaten domisili Anda.'
      );
      return;
    }

    if (!formData.consent_data || !formData.consent_waiver) {
      setError('Anda wajib menyetujui persetujuan data pribadi & pernyataan waiver risiko.');
      return;
    }

    if (formData.jenis_registrasi === 'po_jersey' && !formData.consent_no_refund) {
      setError('Anda wajib menyetujui kebijakan tidak ada refund untuk PO Jersey Amal.');
      return;
    }

    if (
      formData.jenis_registrasi === 'po_jersey' &&
      formData.metode_ambil === 'dikirim' &&
      !formData.alamat_pengiriman.trim()
    ) {
      setError('Mohon isi Alamat Pengiriman Jersey.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nama_lengkap: formData.nama_lengkap.trim(),
        alamat_lengkap: formData.alamat_lengkap.trim(),
        no_telepon: formData.no_telepon.trim(),
        no_telepon_kerabat: formData.no_telepon_kerabat.trim(),
        komunitas: formData.komunitas.trim(),
        jenis_registrasi: formData.jenis_registrasi,
        consent_data: formData.consent_data,
        consent_waiver: formData.consent_waiver,
        consent_no_refund: formData.consent_no_refund,
        jersey_spec:
          formData.jenis_registrasi === 'po_jersey'
            ? {
                jenis_lengan: formData.jenis_lengan,
                ukuran: formData.ukuran,
                qty: formData.qty,
                metode_ambil: formData.metode_ambil,
                alamat_pengiriman:
                  formData.metode_ambil === 'dikirim' ? formData.alamat_pengiriman.trim() : undefined
              }
            : undefined
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        setError(data.error || 'Gagal mendaftar.');
        return;
      }

      if (formData.jenis_registrasi === 'po_jersey' && data.registrant?.nomor_registrasi) {
        router.push(`/pembayaran/${data.registrant.nomor_registrasi}`);
      } else {
        router.push(`/terima-kasih?code=${data.registrant.nomor_registrasi}`);
      }
    } catch (err: any) {
      setLoading(false);
      setError('Terjadi kesalahan koneksi saat mengirim formulir.');
    }
  };

  if (isRegClosed) {
    return (
      <div className="min-h-screen py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-card border border-rose-200">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-navy font-display mb-2">Pendaftaran Telah Ditutup</h2>
          <p className="text-slate-600 text-sm mb-6">
            Pendaftaran peserta Tour de Gunung Batu 2026 telah resmi ditutup pada 25 September 2026.
          </p>
          <Link href="/wall-of-heroes" className="bg-brand-royal text-white px-6 py-3 rounded-xl font-bold">
            Lihat Wall of Heroes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative bg-brand-iceBg">
      <TopoBackground />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="max-w-[160px] max-h-12 mx-auto mb-2 flex items-center justify-center">
            <img src="/images/logo_peaderal_x_rudeboys.png" alt="Logo PEADERAL x Rudeboys" className="max-h-12 w-auto object-contain" />
          </div>
          <div className="inline-flex items-center space-x-2 text-brand-royal font-bold text-xs uppercase bg-brand-royal/10 px-3.5 py-1 rounded-full mb-2">
            <Bike className="w-4 h-4 text-brand-royal" />
            <span>Formulir Pendaftaran Resmi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy font-display">
            TOUR DE GUNUNG BATU 2026
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Silakan lengkapi data Anda di bawah ini untuk pendaftaran event dan pre-order jersey amal.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} action="#" className="space-y-6">
          {/* SECTION 1: PILIHAN ALUR REGISTRASI */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-sky/40 shadow-card space-y-4">
            <h2 className="text-lg font-bold text-brand-navy flex items-center space-x-2 border-b pb-3">
              <span className="w-7 h-7 rounded-full bg-brand-royal text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>Pilih Jenis Pendaftaran</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option A: PO Jersey + Event */}
              <button
                type="button"
                onClick={() => !isPoClosed && setFormData({ ...formData, jenis_registrasi: 'po_jersey' })}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  formData.jenis_registrasi === 'po_jersey'
                    ? 'border-brand-yellow bg-brand-navy text-white shadow-glow'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-sky'
                } ${isPoClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                    formData.jenis_registrasi === 'po_jersey' ? 'bg-brand-yellow text-brand-navy' : 'bg-slate-200 text-slate-600'
                  }`}>
                    Daftar + PO Jersey Amal
                  </span>
                  <Heart className={`w-5 h-5 ${formData.jenis_registrasi === 'po_jersey' ? 'text-brand-yellow fill-brand-yellow' : 'text-slate-400'}`} />
                </div>
                <h3 className="font-extrabold text-base mb-1">Ikut Gowes + Pre-Order Jersey</h3>
                <p className="text-xs opacity-80 leading-relaxed">
                  Dapatkan Jersey Resmi + Donasi Sepeda Anak Yatim (100% Keuntungan) + Nama di Wall of Heroes Emas.
                </p>
                {isPoClosed && <p className="text-[10px] text-amber-400 font-bold mt-2">PO Jersey telah ditutup</p>}
              </button>

              {/* Option B: Daftar Saja */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, jenis_registrasi: 'daftar_saja' })}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  formData.jenis_registrasi === 'daftar_saja'
                    ? 'border-brand-royal bg-brand-royal/10 text-brand-navy font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-sky'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    Gratis 100%
                  </span>
                  <Bike className="w-5 h-5 text-brand-royal" />
                </div>
                <h3 className="font-extrabold text-base mb-1">Daftar Saja (Tanpa Jersey)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tercatat resmi sebagai peserta gowes mandiri. Bebas biaya pendaftaran. Mendapatkan Nomor BIB digital.
                </p>
              </button>
            </div>
          </div>

          {/* SECTION 2: DATA DIRI PESERTA */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-sky/40 shadow-card space-y-4">
            <h2 className="text-lg font-bold text-brand-navy flex items-center space-x-2 border-b pb-3">
              <span className="w-7 h-7 rounded-full bg-brand-royal text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>Data Pribadi Peserta</span>
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Sesuai KTP / Identitas"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-royal focus:outline-none"
                />
              </div>

              {formData.jenis_registrasi === 'daftar_saja' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Kota / Kabupaten Domisili *</label>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                      Cepat &amp; Praktis
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bogor / Jakarta Selatan / Depok / Bekasi"
                    value={formData.alamat_lengkap}
                    onChange={(e) => setFormData({ ...formData, alamat_lengkap: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-royal focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    *Cukup isi kota/kabupaten domisili Anda untuk pendataan peserta gowes mandiri.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Alamat Lengkap (Untuk Pengiriman Jersey &amp; Validasi) *
                    </label>
                    <span className="text-[11px] text-amber-700 font-bold bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                      Wajib Pengiriman
                    </span>
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos"
                    value={formData.alamat_lengkap}
                    onChange={(e) => setFormData({ ...formData, alamat_lengkap: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-royal focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    *Diperlukan untuk kelengkapan administrasi pengiriman jersey resmi.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Telepon / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={formData.no_telepon}
                    onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-royal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Telepon Kerabat Terdekat (Opsional)</label>
                  <input
                    type="tel"
                    placeholder="Untuk kontak darurat"
                    value={formData.no_telepon_kerabat}
                    onChange={(e) => setFormData({ ...formData, no_telepon_kerabat: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-royal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Asal Komunitas / Team (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Rudeboys Cyclist (Kosongkan jika individu/umum)"
                  value={formData.komunitas}
                  onChange={(e) => setFormData({ ...formData, komunitas: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-royal focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  *Jika dikosongkan, otomatis tercatat sebagai "Umum" di leaderboard Wall of Heroes.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: SPESIFIKASI PO JERSEY (BILA DIPIH) */}
          {formData.jenis_registrasi === 'po_jersey' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-yellow/60 shadow-glow space-y-4">
              <h2 className="text-lg font-bold text-brand-navy flex items-center space-x-2 border-b pb-3">
                <span className="w-7 h-7 rounded-full bg-brand-yellow text-brand-navy font-bold flex items-center justify-center text-xs">3</span>
                <span>Spesifikasi Pre-Order Jersey Amal</span>
              </h2>

              {/* OFFICIAL JERSEY DESIGN PREVIEW FRAME */}
              <div className="bg-brand-navy p-3 rounded-2xl border-2 border-brand-yellow/60 text-white text-center">
                <span className="text-[11px] font-bold text-brand-yellow block uppercase mb-1">
                  Desain Resmi Official Jersey PEADERAL x RUDEBOYS
                </span>
                <div className="max-h-[300px] sm:max-h-[350px] w-full flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img
                    src="/images/design_jersey.jpg?v=20260908"
                    alt="Official Jersey Design Frame"
                    className="max-h-[290px] sm:max-h-[340px] w-auto h-auto object-contain mx-auto"
                  />
                </div>
              </div>

              <div className="space-y-4 text-sm pt-2">
                {/* Jenis Lengan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-2">Pilih Jenis Lengan</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, jenis_lengan: 'short_sleeve' })}
                      className={`p-3 rounded-xl border font-bold text-center transition-all ${
                        formData.jenis_lengan === 'short_sleeve'
                          ? 'border-brand-royal bg-brand-royal text-white shadow-md'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Short Sleeve (Lengan Pendek)<br />
                      <span className="text-xs font-normal opacity-90">Rp {settings.harga_short_sleeve.toLocaleString('id-ID')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, jenis_lengan: 'long_sleeve' })}
                      className={`p-3 rounded-xl border font-bold text-center transition-all ${
                        formData.jenis_lengan === 'long_sleeve'
                          ? 'border-brand-royal bg-brand-royal text-white shadow-md'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Long Sleeve (Lengan Panjang)<br />
                      <span className="text-xs font-normal opacity-90">Rp {settings.harga_long_sleeve.toLocaleString('id-ID')}</span>
                    </button>
                  </div>
                </div>

                {/* Ukuran & Jumlah */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ukuran Jersey</label>
                    <select
                      value={formData.ukuran}
                      onChange={(e) => setFormData({ ...formData, ukuran: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-royal focus:outline-none font-bold"
                    >
                      <option value="S">S (Lebar 48cm / Panjang 69cm)</option>
                      <option value="M">M (Lebar 50cm / Panjang 71cm)</option>
                      <option value="L">L (Lebar 52cm / Panjang 73cm)</option>
                      <option value="XL">XL (Lebar 54cm / Panjang 75cm)</option>
                      <option value="XXL">XXL / 2XL (Lebar 56cm / Panjang 77cm)</option>
                      <option value="3XL">3XL (Lebar 58cm / Panjang 79cm)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jumlah (Qty)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.qty}
                      onChange={(e) => setFormData({ ...formData, qty: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-royal focus:outline-none font-bold text-center"
                    />
                  </div>
                </div>

                {/* Size Chart Toggle & Expandable Component */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSizeChart(!showSizeChart)}
                    className="inline-flex items-center space-x-1.5 text-xs text-brand-royal hover:text-brand-navy font-bold bg-brand-royal/10 hover:bg-brand-royal/20 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <Ruler className="w-4 h-4 text-brand-royal" />
                    <span>{showSizeChart ? 'Sembunyikan Size Chart' : 'Lihat Tabel Size Chart (Panduan Ukuran)'}</span>
                  </button>

                  {showSizeChart && (
                    <div className="mt-3">
                      <SizeChart />
                    </div>
                  )}
                </div>

                {/* Metode Ambil */}
                <div>
                  <label className="block font-bold text-slate-700 mb-2">Metode Pengambilan Jersey</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, metode_ambil: 'ambil_langsung' })}
                      className={`p-3 rounded-xl border font-bold text-center transition-all ${
                        formData.metode_ambil === 'ambil_langsung'
                          ? 'border-brand-navy bg-brand-navy text-white shadow-md'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Ambil Langsung<br />
                      <span className="text-[11px] font-normal opacity-90">Di Titik Kumpul / Hari-H</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, metode_ambil: 'dikirim' })}
                      className={`p-3 rounded-xl border font-bold text-center transition-all ${
                        formData.metode_ambil === 'dikirim'
                          ? 'border-brand-navy bg-brand-navy text-white shadow-md'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Dikirim via Ekspedisi<br />
                      <span className="text-[11px] font-normal opacity-90">Ongkir ditanggung pembeli</span>
                    </button>
                  </div>
                </div>

                {/* Alamat Pengiriman jika dikirim */}
                {formData.metode_ambil === 'dikirim' && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">Alamat Pengiriman Jersey *</label>
                      {formData.alamat_lengkap.trim() && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, alamat_pengiriman: formData.alamat_lengkap })}
                          className="text-[11px] text-brand-royal hover:text-brand-navy font-bold bg-brand-royal/10 hover:bg-brand-royal/20 px-2.5 py-0.5 rounded-lg transition-all"
                        >
                          Gunakan alamat di atas
                        </button>
                      )}
                    </div>
                    <textarea
                      required={formData.metode_ambil === 'dikirim'}
                      rows={2}
                      placeholder="Alamat lengkap penerima paket ekspedisi JNE/JNT..."
                      value={formData.alamat_pengiriman}
                      onChange={(e) => setFormData({ ...formData, alamat_pengiriman: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-royal focus:outline-none"
                    />
                  </div>
                )}

                {/* Total Preview */}
                <div className="p-4 bg-brand-navy text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-brand-sky block">Total Pembayaran PO Jersey</span>
                    <span className="text-xs text-brand-yellow font-medium">100% Utuh Untuk Donasi Sepeda</span>
                  </div>
                  <span className="text-2xl font-black text-brand-yellow font-display">
                    Rp {totalHarga.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: CONSENT & WAIVER PERSETUJUAN */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-sky/40 shadow-card space-y-4 text-xs sm:text-sm">
            <h2 className="text-lg font-bold text-brand-navy flex items-center space-x-2 border-b pb-3">
              <span className="w-7 h-7 rounded-full bg-brand-royal text-white flex items-center justify-center text-xs font-bold">
                {formData.jenis_registrasi === 'po_jersey' ? '4' : '3'}
              </span>
              <span>Persetujuan &amp; Waiver Risiko</span>
            </h2>

            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent_data}
                  onChange={(e) => setFormData({ ...formData, consent_data: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-brand-royal rounded border-slate-300 focus:ring-brand-royal"
                />
                <span className="text-slate-700 leading-snug">
                  Saya mengizinkan data pribadi saya disimpan oleh panitia PEADERAL x Rudeboys Cyclist untuk keperluan verifikasi pendaftaran &amp; logistik event.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent_waiver}
                  onChange={(e) => setFormData({ ...formData, consent_waiver: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-brand-royal rounded border-slate-300 focus:ring-brand-royal"
                />
                <span className="text-slate-700 leading-snug">
                  Saya telah membaca &amp; menyetujui <Link href="/peraturan" target="_blank" className="text-brand-royal underline font-bold">Waiver Pernyataan Risiko Event Mandiri (Self-Supported)</Link>. Segala risiko keselamatan pribadi selama bersepeda menjadi tanggung jawab pribadi peserta ("yakin lanjut, ragu putar balik").
                </span>
              </label>

              {formData.jenis_registrasi === 'po_jersey' && (
                <label className="flex items-start space-x-3 cursor-pointer pt-1 border-t border-slate-100">
                  <input
                    type="checkbox"
                    required={formData.jenis_registrasi === 'po_jersey'}
                    checked={formData.consent_no_refund}
                    onChange={(e) => setFormData({ ...formData, consent_no_refund: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-brand-yellow rounded border-slate-300 focus:ring-brand-yellow"
                  />
                  <span className="text-slate-800 font-medium leading-snug">
                    Saya memahami bahwa PO Jersey Amal bersifat final dan <strong className="text-rose-600">tidak dapat di-refund</strong> karena 100% keuntungannya langsung dialokasikan untuk produksi &amp; donasi sepeda anak yatim/dhuafa.
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-yellow to-amber-400 hover:from-amber-400 hover:to-brand-yellow text-brand-navy font-extrabold py-4 rounded-2xl shadow-glow text-lg transition-transform hover:scale-[1.02] flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <span>Memproses Pendaftaran...</span>
            ) : formData.jenis_registrasi === 'po_jersey' ? (
              <>
                <span>Lanjut ke Halaman Pembayaran QRIS Statis (Rp {totalHarga.toLocaleString('id-ID')})</span>
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>Selesaikan Pendaftaran Gratis (Rp 0)</span>
                <CheckCircle className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Susulan PO Link */}
        <div className="text-center mt-6">
          <Link
            href="/susulan-po"
            className="text-xs text-slate-500 hover:text-brand-royal font-medium inline-flex items-center space-x-1"
          >
            <span>Sudah daftar sebelumnya tapi belum ikut PO Jersey?</span>
            <strong className="underline text-brand-royal">Susulan PO di sini</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DaftarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center text-sm font-semibold">Memuat formulir pendaftaran...</div>}>
      <DaftarFormContent />
    </Suspense>
  );
}
