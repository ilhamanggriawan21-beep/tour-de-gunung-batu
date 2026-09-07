'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopoBackground from '@/components/TopoBackground';
import { Search, Shirt, Heart, AlertCircle, ArrowRight, UserCheck, CheckCircle, Bike } from 'lucide-react';

export default function SusulanPOPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundData, setFoundData] = useState<any>(null);

  // Jersey Spec State
  const [jerseySpec, setJerseySpec] = useState({
    jenis_lengan: 'short_sleeve' as 'short_sleeve' | 'long_sleeve',
    ukuran: 'L' as 'S' | 'M' | 'L' | 'XL' | 'XXL',
    qty: 1,
    metode_ambil: 'ambil_langsung' as 'ambil_langsung' | 'dikirim',
    alamat_pengiriman: '',
    consent_no_refund: false
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFoundData(null);

    if (!searchQuery.trim()) {
      setError('Masukkan Nomor Registrasi (mis. TDGB-50774) atau Nomor Telepon yang Anda gunakan saat mendaftar.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/payment/status?code=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setLoading(false);

      if (!data.success || !data.registrant) {
        setError('Data pendaftaran tidak ditemukan. Pastikan Anda memasukkan Nomor Registrasi atau No. Telepon yang benar.');
        return;
      }

      setFoundData(data);
    } catch (err) {
      setLoading(false);
      setError('Gagal mencari data registrasi.');
    }
  };

  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!jerseySpec.consent_no_refund) {
      setError('Anda wajib menyetujui kebijakan tidak ada refund untuk PO Jersey Amal.');
      return;
    }

    if (jerseySpec.metode_ambil === 'dikirim' && !jerseySpec.alamat_pengiriman.trim()) {
      setError('Mohon lengkapi Alamat Pengiriman Jersey.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/susulan-po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrantIdOrNo: foundData.registrant.id,
          jerseySpec: {
            ...jerseySpec,
            alamat_pengiriman: jerseySpec.metode_ambil === 'dikirim' ? jerseySpec.alamat_pengiriman.trim() : undefined
          }
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        setError(data.error || 'Gagal menyimpan PO susulan.');
        return;
      }

      router.push(`/pembayaran/${data.registrant.nomor_registrasi}`);
    } catch (err) {
      setLoading(false);
      setError('Terjadi kesalahan koneksi.');
    }
  };

  const totalHarga = foundData?.settings
    ? (jerseySpec.jenis_lengan === 'short_sleeve' ? foundData.settings.harga_short_sleeve : foundData.settings.harga_long_sleeve) * jerseySpec.qty
    : 0;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative bg-brand-iceBg">
      <TopoBackground />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 text-brand-yellow font-bold text-xs uppercase bg-brand-navy px-3.5 py-1 rounded-full mb-2">
            <Shirt className="w-4 h-4 text-brand-yellow" />
            <span>Alur Susulan PO Jersey &amp; Cek Status</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy font-display">
            CEK STATUS &amp; SUSULAN PO JERSEY
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Khusus peserta yang sudah "Daftar Saja" dan ingin ikut menyusul donasi sepeda lewat PO Jersey resmi tanpa perlu mengisi ulang data pribadi dari nol.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: SEARCH FORM */}
        {!foundData ? (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-sky/40 shadow-card">
            <h2 className="text-lg font-bold text-brand-navy mb-4 flex items-center space-x-2">
              <Search className="w-5 h-5 text-brand-royal" />
              <span>Cari Data Pendaftaran Anda</span>
            </h2>

            <form onSubmit={handleSearch} action="#" className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 text-sm mb-1">
                  Nomor Registrasi atau Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TDGB-50774 atau 08123456789"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-royal focus:outline-none text-sm font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  *Masukkan nomor registrasi yang didapat saat submit pendaftaran atau nomor WhatsApp Anda.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-navy hover:bg-brand-royalDark text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? <span>Mencari Data...</span> : <span>Cari Data Pendaftaran</span>}
              </button>
            </form>

            <div className="pt-6 border-t border-slate-100 text-center mt-6">
              <span className="text-xs text-slate-500">Belum pernah mendaftar sama sekali? </span>
              <Link href="/daftar" className="text-xs font-bold text-brand-royal hover:underline">
                Daftar Baru di Sini
              </Link>
            </div>
          </div>
        ) : (
          /* STEP 2: REGISTRANT FOUND */
          <div className="space-y-6">
            {/* Found Card info */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase block">Data Ditemukan</span>
                  <h3 className="font-extrabold text-lg text-brand-navy">{foundData.registrant.nama_lengkap}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    BIB #{foundData.registrant.nomor_bib} • {foundData.registrant.nomor_registrasi} • {foundData.registrant.komunitas || 'Umum'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFoundData(null)}
                className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
              >
                Cari Data Lain
              </button>
            </div>

            {/* Check if user already has a jersey PO */}
            {foundData.jersey_po ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-sky/40 shadow-card text-center space-y-4">
                {foundData.jersey_po.status_pembayaran === 'lunas' ? (
                  <div className="space-y-3">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                    <h3 className="text-xl font-bold text-brand-navy">Pembayaran PO Jersey Anda Telah LUNAS!</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      Terima kasih atas kontribusi Anda. Nama Anda telah tercatat dengan warna emas di Wall of Heroes.
                    </p>
                    <div className="pt-2">
                      <Link
                        href={`/terima-kasih?code=${foundData.registrant.nomor_registrasi}`}
                        className="inline-flex items-center space-x-2 bg-brand-royal text-white px-5 py-2.5 rounded-xl font-bold text-xs"
                      >
                        <span>Unduh Kartu Nomor BIB Digital</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Shirt className="w-12 h-12 text-brand-yellow mx-auto" />
                    <h3 className="text-xl font-bold text-brand-navy">Pesanan PO Jersey Sedang Menunggu Verifikasi</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      Total: <strong>Rp {foundData.jersey_po.harga_total.toLocaleString('id-ID')}</strong> ({foundData.jersey_po.jenis_lengan === 'short_sleeve' ? 'Short Sleeve' : 'Long Sleeve'} Size {foundData.jersey_po.ukuran}).
                    </p>
                    <div className="pt-2">
                      <Link
                        href={`/pembayaran/${foundData.registrant.nomor_registrasi}`}
                        className="inline-flex items-center space-x-2 bg-brand-navy text-white px-6 py-3 rounded-xl font-bold text-xs shadow-glow"
                      >
                        <span>Buka Halaman Pembayaran &amp; Upload Bukti Transfer</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* FORM TO ADD LATE JERSEY PO */
              <form onSubmit={handlePOSubmit} action="#" className="space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-yellow/60 shadow-glow space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h2 className="text-lg font-bold text-brand-navy flex items-center space-x-2">
                      <Shirt className="w-5 h-5 text-brand-yellow" />
                      <span>Pilih Spesifikasi Jersey Amal Anda</span>
                    </h2>
                    <span className="text-xs bg-brand-yellow text-brand-navy px-2.5 py-1 rounded-full font-bold">
                      100% Amal
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Data nama, domisili, dan nomor telepon diambil otomatis dari pendaftaran Anda sebelumnya. Silakan pilih spesifikasi jersey:
                  </p>

                  {/* Jenis Lengan */}
                  <div>
                    <label className="block font-bold text-slate-700 text-sm mb-2">Pilih Jenis Lengan</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setJerseySpec({ ...jerseySpec, jenis_lengan: 'short_sleeve' })}
                        className={`p-3 rounded-xl border font-bold text-center transition-all ${
                          jerseySpec.jenis_lengan === 'short_sleeve'
                            ? 'border-brand-royal bg-brand-royal text-white shadow-md'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Short Sleeve<br />
                        <span className="text-xs font-normal opacity-90">
                          Rp {foundData.settings.harga_short_sleeve.toLocaleString('id-ID')}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setJerseySpec({ ...jerseySpec, jenis_lengan: 'long_sleeve' })}
                        className={`p-3 rounded-xl border font-bold text-center transition-all ${
                          jerseySpec.jenis_lengan === 'long_sleeve'
                            ? 'border-brand-royal bg-brand-royal text-white shadow-md'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Long Sleeve<br />
                        <span className="text-xs font-normal opacity-90">
                          Rp {foundData.settings.harga_long_sleeve.toLocaleString('id-ID')}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Ukuran & Jumlah */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 text-sm mb-1">Ukuran Jersey</label>
                      <select
                        value={jerseySpec.ukuran}
                        onChange={(e) => setJerseySpec({ ...jerseySpec, ukuran: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-brand-royal"
                      >
                        <option value="S">S (Lingkar Dada ±92cm)</option>
                        <option value="M">M (Lingkar Dada ±96cm)</option>
                        <option value="L">L (Lingkar Dada ±100cm)</option>
                        <option value="XL">XL (Lingkar Dada ±104cm)</option>
                        <option value="XXL">XXL (Lingkar Dada ±108cm)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 text-sm mb-1">Jumlah (Qty)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={jerseySpec.qty}
                        onChange={(e) => setJerseySpec({ ...jerseySpec, qty: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-center text-sm focus:ring-2 focus:ring-brand-royal"
                      />
                    </div>
                  </div>

                  {/* Metode Ambil */}
                  <div>
                    <label className="block font-bold text-slate-700 text-sm mb-2">Metode Pengambilan</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setJerseySpec({ ...jerseySpec, metode_ambil: 'ambil_langsung' })}
                        className={`p-3 rounded-xl border font-bold text-center transition-all ${
                          jerseySpec.metode_ambil === 'ambil_langsung'
                            ? 'border-brand-navy bg-brand-navy text-white shadow-md'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Ambil Langsung<br />
                        <span className="text-[11px] font-normal opacity-90">Di Titik Kumpul / Hari-H</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setJerseySpec({ ...jerseySpec, metode_ambil: 'dikirim' })}
                        className={`p-3 rounded-xl border font-bold text-center transition-all ${
                          jerseySpec.metode_ambil === 'dikirim'
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
                  {jerseySpec.metode_ambil === 'dikirim' && (
                    <div>
                      <label className="block font-bold text-slate-700 text-sm mb-1">Alamat Pengiriman Paket *</label>
                      <textarea
                        required={jerseySpec.metode_ambil === 'dikirim'}
                        rows={2}
                        placeholder="Alamat lengkap penerima paket pengiriman ekspedisi JNE/JNT..."
                        value={jerseySpec.alamat_pengiriman}
                        onChange={(e) => setJerseySpec({ ...jerseySpec, alamat_pengiriman: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-royal"
                      />
                    </div>
                  )}

                  {/* Total Nominal */}
                  <div className="p-4 bg-brand-navy text-white rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-brand-sky block">Total Pembayaran PO Jersey</span>
                      <span className="text-xs text-brand-yellow font-medium">100% Utuh Untuk Donasi Sepeda</span>
                    </div>
                    <span className="text-2xl font-black text-brand-yellow font-display">
                      Rp {totalHarga.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Consent No Refund */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={jerseySpec.consent_no_refund}
                        onChange={(e) => setJerseySpec({ ...jerseySpec, consent_no_refund: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-brand-yellow rounded border-slate-300 focus:ring-brand-yellow"
                      />
                      <span className="text-xs text-slate-800 font-medium leading-snug">
                        Saya memahami bahwa PO Jersey Amal bersifat final dan <strong className="text-rose-600">tidak dapat di-refund</strong> karena 100% keuntungannya langsung dialokasikan untuk donasi sepeda anak yatim/dhuafa.
                      </span>
                    </label>
                  </div>

                  {/* Submit PO */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-brand-yellow to-amber-400 hover:from-amber-400 hover:to-brand-yellow text-brand-navy font-extrabold py-4 rounded-2xl shadow-glow text-base transition-transform hover:scale-[1.02] flex items-center justify-center space-x-2 cursor-pointer mt-4"
                  >
                    {loading ? (
                      <span>Memproses PO Susulan...</span>
                    ) : (
                      <>
                        <span>Lanjut ke Pembayaran QRIS Statis (Rp {totalHarga.toLocaleString('id-ID')})</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
