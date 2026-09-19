'use client';

import React, { useEffect, useState } from 'react';
import { Download, Share2, Loader2, X } from 'lucide-react';
import { saveOrShareImage, generateBibCanvas } from '@/lib/downloadBib';

interface BibCardProps {
  nomorBib?: number;
  namaLengkap: string;
  komunitas?: string;
  divisi?: string;
  isPanitia?: boolean;
  nomorRegistrasi?: string;
  jenisRegistrasi?: 'daftar_saja' | 'po_jersey';
}

export default function BibCard({
  nomorBib,
  namaLengkap,
  komunitas,
  divisi,
  isPanitia,
  nomorRegistrasi,
  jenisRegistrasi
}: BibCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [iosModalUrl, setIosModalUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  // The on-page preview is rendered from the same high-resolution canvas that
  // is saved as PNG. This prevents browser breakpoints, font metrics, or text
  // overflow from making the preview and the downloaded BIB look different.
  useEffect(() => {
    let active = true;

    setPreviewUrl(null);
    setPreviewFailed(false);

    void generateBibCanvas({
      nomorBib,
      namaLengkap,
      komunitas,
      divisi,
      isPanitia,
      nomorRegistrasi,
      jenisRegistrasi,
    })
      .then((canvas) => {
        if (active) setPreviewUrl(canvas.toDataURL('image/png'));
      })
      .catch(() => {
        if (active) setPreviewFailed(true);
      });

    return () => {
      active = false;
    };
  }, [jenisRegistrasi, komunitas, divisi, isPanitia, namaLengkap, nomorBib, nomorRegistrasi]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      if (typeof document !== 'undefined' && 'fonts' in document) {
        await document.fonts.ready;
      }

      // Generate direct 2.5K image directly - zero DOM responsive scaling issues, zero dark Safari screens
      const canvas = await generateBibCanvas({
        nomorBib,
        namaLengkap,
        komunitas,
        divisi,
        isPanitia,
        nomorRegistrasi,
        jenisRegistrasi,
      });

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Gagal menghasilkan file gambar.');

      const filename = isPanitia
        ? `NAMETAG_PANITIA_${(namaLengkap || 'PANITIA').replace(/\s+/g, '_').toUpperCase()}.png`
        : `BIB_TOUR_DE_GUNUNG_BATU_${nomorBib}.png`;

      await saveOrShareImage(
        blob,
        filename,
        isPanitia ? `Name Tag ${namaLengkap}` : `BIB #${nomorBib}`,
        (url) => setIosModalUrl(url)
      );
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal memproses gambar BIB. Silakan coba kembali.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWA = () => {
    const text = `Halo! Saya sudah resmi terdaftar di Tour de Gunung Batu 2026 dengan Nomor BIB #${nomorBib}!\nYuk ikut gowes dan donasi jersey amal di: https://tour-de-gunung-batu.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6">
        {/* The canvas preview is byte-for-byte the same composition as the PNG download. */}
        <div
          className="relative w-full aspect-[2482/1749] rounded-2xl overflow-hidden shadow-2xl bg-slate-900"
          aria-busy={!previewUrl && !previewFailed}
        >
          <img
            src={previewUrl || '/bib-template-revisi.png?v=3'}
            alt={`Nomor BIB ${String(nomorBib).padStart(4, '0')} untuk ${namaLengkap}`}
            className="block w-full h-full object-cover select-none"
          />

          {!previewUrl && (
            <div className="absolute inset-x-0 bottom-0 bg-brand-navy/90 px-4 py-2 text-center text-xs font-bold text-brand-yellow">
              {previewFailed ? 'Pratinjau BIB belum dapat dibuat. Silakan unduh ulang.' : 'Menyiapkan pratinjau BIB...'}
            </div>
          )}
        </div>

      {/* Buttons Action */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full sm:w-auto bg-brand-yellow hover:bg-amber-400 text-brand-navy font-bold px-6 py-3 rounded-xl shadow-glow transition-transform hover:scale-105 flex items-center justify-center space-x-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses Gambar BIB...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Unduh Nomor BIB (PNG)</span>
            </>
          )}
        </button>
        <button
          onClick={handleShareWA}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-transform hover:scale-105 flex items-center justify-center space-x-2 text-sm"
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan ke WhatsApp</span>
        </button>
      </div>

      {/* iOS / Fallback Save Image Modal */}
      {iosModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Simpan gambar BIB">
          <div className="bg-slate-900 border border-brand-yellow/50 rounded-3xl p-5 max-w-lg w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto text-center text-white shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto mx-auto">
            <button
              onClick={() => setIosModalUrl(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-3 text-left">
              <span className="text-xs font-black text-brand-yellow uppercase tracking-wider block">
                Petunjuk Simpan Gambar (iPhone / iPad)
              </span>
              <p className="text-xs text-slate-300 mt-1">
                <strong>Tekan dan tahan</strong> gambar BIB di bawah ini, lalu pilih <strong>"Simpan ke Foto" (Save to Photos)</strong> atau <strong>"Bagikan"</strong>.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/20 shadow-lg mb-4 bg-slate-950">
              <img
                src={iosModalUrl}
                alt={`Nomor BIB ${nomorBib}`}
                className="w-full h-auto object-contain select-auto"
              />
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={iosModalUrl}
                download={`BIB_TOUR_DE_GUNUNG_BATU_${nomorBib}.png`}
                className="w-full bg-brand-yellow hover:bg-amber-400 text-brand-navy font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Buka / Unduh File Gambar</span>
              </a>
              <button
                onClick={() => setIosModalUrl(null)}
                className="w-full bg-white/10 hover:bg-white/20 text-slate-300 py-2 rounded-xl text-xs font-semibold"
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
