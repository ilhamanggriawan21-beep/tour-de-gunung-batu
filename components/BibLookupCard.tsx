'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Loader2, Search, Users } from 'lucide-react';
import Link from 'next/link';
import BibCard from '@/components/BibCard';

type BibParticipant = {
  participant_number: string;
  nama_lengkap: string;
  komunitas: string;
  nomor_registrasi: string;
  jenis_registrasi: 'daftar_saja' | 'po_jersey';
  bib_status: 'tersedia';
  batch_produksi?: number | null;
  status_jersey?: string | null;
};

export default function BibLookupCard() {
  const [participantNumber, setParticipantNumber] = useState('');
  const [participant, setParticipant] = useState<BibParticipant | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setParticipant(null);

    if (!participantNumber) {
      setMessage('Masukkan nomor peserta 4 digit.');
      return;
    }

    if (!/^\d{4}$/.test(participantNumber)) {
      setMessage('Masukkan nomor peserta 4 digit.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bib', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantNumber }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.error || 'Terjadi kesalahan saat memeriksa data. Silakan coba lagi.');
        return;
      }

      setParticipant(data.participant);
    } catch {
      setMessage('Terjadi kesalahan saat memeriksa data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="cek-bib" className="scroll-mt-28 bg-gradient-to-br from-brand-navy to-brand-royalDark p-5 sm:p-8 rounded-3xl border border-brand-yellow/60 shadow-glow text-white">
      <div className="text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-yellow/15 border border-brand-yellow/30 text-brand-yellow px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
          <Download className="w-3.5 h-3.5" />
          Sudah terdaftar?
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-black font-display text-white">CEK &amp; DOWNLOAD BIB</h2>
        <p className="mt-2 text-sm text-brand-sky leading-relaxed">Masukkan nomor peserta 4 digit untuk menemukan dan mengunduh BIB resmi kamu.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-md mx-auto space-y-3">
        <label htmlFor="participant-number" className="sr-only">Nomor peserta 4 digit</label>
        <input
          id="participant-number"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          autoComplete="off"
          placeholder="Contoh: 1027"
          value={participantNumber}
          onChange={(event) => setParticipantNumber(event.target.value.replace(/\D/g, '').slice(0, 4))}
          className="w-full rounded-2xl border-2 border-white/20 bg-white px-4 py-4 text-center font-mono text-2xl font-black tracking-[0.35em] text-brand-navy placeholder:tracking-normal placeholder:text-sm placeholder:font-semibold focus:border-brand-yellow focus:outline-none"
          aria-describedby="participant-number-help"
        />
        <p id="participant-number-help" className="text-center text-[11px] text-brand-sky">Gunakan tepat 4 angka, termasuk nol di depan bila ada.</p>
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-12 rounded-2xl bg-brand-yellow px-5 py-3.5 font-black text-brand-navy shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          <span>{loading ? 'Memeriksa nomor peserta...' : 'CEK BIB'}</span>
        </button>
      </form>

      {message && (
        <div role="status" className="mt-4 max-w-md mx-auto rounded-2xl border border-rose-300/40 bg-rose-950/30 px-4 py-3 text-center text-sm text-rose-100">
          <AlertCircle className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
          {message}
          {message === 'Nomor peserta tidak ditemukan.' && (
            <span className="block mt-1 text-brand-sky">Lupa nomor peserta? <Link href="/wall-of-heroes" className="font-bold text-brand-yellow underline">Cari nama kamu di Wall of Heroes.</Link></span>
          )}
        </div>
      )}

      {participant && (
        <div className="mt-6 space-y-5">
          <div className="max-w-md mx-auto rounded-3xl border border-emerald-300/40 bg-white p-5 text-center text-brand-navy shadow-card">
            <CheckCircle2 className="w-9 h-9 mx-auto text-emerald-600 mb-2" />
            <p className="text-xs font-black uppercase tracking-wider text-emerald-700">BIB ditemukan</p>
            <h3 className="mt-1 text-xl font-black">{participant.nama_lengkap}</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-2xl bg-brand-iceBg p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">No. Peserta</span>
                <strong className="font-mono text-lg text-brand-royal">#{participant.participant_number}</strong>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Status BIB</span>
                <strong className="text-sm text-emerald-700">Sudah tersedia</strong>
              </div>
            </div>

            {participant.jenis_registrasi === 'po_jersey' && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-left">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Status Jersey</span>
                  <strong className="text-xs text-brand-navy">
                    {participant.status_jersey === 'lunas' ? 'Jersey Lunas' : 'Menunggu Verifikasi'}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Batch Produksi</span>
                  {participant.batch_produksi === 1 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Batch 1 (Kloter 1)
                    </span>
                  ) : participant.batch_produksi === 2 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-300">
                      Batch 2 (Kloter 2)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Antrian Batch
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <BibCard
            nomorBib={Number(participant.participant_number)}
            namaLengkap={participant.nama_lengkap}
            komunitas={participant.komunitas}
            nomorRegistrasi={participant.nomor_registrasi}
            jenisRegistrasi={participant.jenis_registrasi}
          />
        </div>
      )}

      {!participant && !message && (
        <p className="mt-5 text-center text-xs text-brand-sky">
          Lupa nomor peserta? <Link href="/wall-of-heroes" className="font-bold text-brand-yellow underline">Cari nama kamu di Wall of Heroes.</Link>
        </p>
      )}
    </section>
  );
}
