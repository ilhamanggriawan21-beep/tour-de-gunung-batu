'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TopoBackground from '@/components/TopoBackground';
import {
  ShieldCheck,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Copy,
  Heart,
  RefreshCw,
  Image as ImageIcon,
  Phone
} from 'lucide-react';

export default function PembayaranPage() {
  const params = useParams();
  const router = useRouter();
  const nomorRegistrasi = params.nomor_registrasi as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const [uploading, setUploading] = useState(false);
  const [buktiInput, setBuktiInput] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [consentNoRefund, setConsentNoRefund] = useState(false);

  const fetchStatus = () => {
    setLoading(true);
    fetch(`/api/payment/status?code=${encodeURIComponent(nomorRegistrasi)}`)
      .then((res) => res.json())
      .then((d) => {
        setLoading(false);
        if (d.success) {
          setData(d);
          if (d.jersey_po?.bukti_transfer_url) {
            setFilePreview(d.jersey_po.bukti_transfer_url);
          }
        } else {
          setError(d.error || 'Data registrasi tidak ditemukan');
        }
      })
      .catch(() => {
        setLoading(false);
        setError('Gagal memuat status pendaftaran');
      });
  };

  useEffect(() => {
    if (nomorRegistrasi) {
      fetchStatus();
    }
  }, [nomorRegistrasi]);

  const handleCopyRekening = () => {
    if (!data?.settings?.nomor_rekening) return;
    navigator.clipboard.writeText(data.settings.nomor_rekening);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setFilePreview(result);
        setBuktiInput(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadBukti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buktiInput.trim()) {
      alert('Pilih file gambar bukti transfer atau masukkan URL bukti transfer.');
      return;
    }

    if (!consentNoRefund) {
      alert('Anda wajib mencentang persetujuan kebijakan tidak ada refund.');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/payment/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomor_registrasi: nomorRegistrasi,
          bukti_url: buktiInput.trim()
        })
      });
      const resData = await res.json();
      setUploading(false);

      if (resData.success) {
        alert('Bukti transfer berhasil diunggah! Status pesanan kini: MENUNGGU VERIFIKASI.');
        fetchStatus();
      } else {
        alert(resData.error || 'Gagal mengunggah bukti');
      }
    } catch (err) {
      setUploading(false);
      alert('Terjadi kesalahan koneksi saat mengunggah bukti');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-brand-royal border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-semibold">Memuat Halaman Pembayaran...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-card border border-rose-200">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Pendaftaran Tidak Ditemukan</h2>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <Link href="/daftar" className="bg-brand-royal text-white px-6 py-2.5 rounded-xl text-sm font-bold">
            Kembali ke Form Pendaftaran
          </Link>
        </div>
      </div>
    );
  }

  const { registrant, jersey_po, settings } = data;
  const status = jersey_po?.status_pembayaran || 'menunggu_verifikasi';

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative bg-brand-iceBg">
      <TopoBackground />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-brand-royal font-bold text-xs uppercase bg-brand-royal/10 px-3.5 py-1 rounded-full mb-2">
            <ShieldCheck className="w-4 h-4 text-brand-royal" />
            <span>0% Potongan Fee — 100% Dana Amal Utuh</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy font-display">
            PEMBAYARAN PO JERSEY AMAL
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Nomor Registrasi: <strong className="font-mono text-brand-royal font-bold">{nomorRegistrasi}</strong> | Peserta: <strong>{registrant.nama_lengkap}</strong>
          </p>
        </div>

        {/* Status Badge Notification */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-semibold ${
          status === 'lunas'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : status === 'perlu_klarifikasi'
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          <div className="flex items-center space-x-2">
            {status === 'lunas' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : status === 'perlu_klarifikasi' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <span>
              Status Pembayaran: <strong className="uppercase font-bold">{status.replace('_', ' ')}</strong>
            </span>
          </div>

          <button
            onClick={fetchStatus}
            className="text-xs text-brand-royal hover:underline flex items-center space-x-1 font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Periksa Pembaruan Status</span>
          </button>
        </div>

        {/* Split Grid: Left QRIS & Rekening, Right Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Instruksi Pembayaran */}
          <div className="bg-white p-6 rounded-3xl border border-brand-sky/40 shadow-card space-y-4">
            <h2 className="font-bold text-slate-800 text-base border-b pb-2">Instruksi Pembayaran QRIS Statis</h2>

            <div className="p-4 bg-brand-navy text-white rounded-2xl text-center">
              <span className="text-xs text-brand-sky block">Total Nominal Transfer</span>
              <span className="text-3xl font-black text-brand-yellow font-display block my-1">
                Rp {jersey_po ? jersey_po.harga_total.toLocaleString('id-ID') : 0}
              </span>
              <span className="text-[11px] text-brand-sky/80 block">
                Jersey {jersey_po?.jenis_lengan === 'short_sleeve' ? 'Short Sleeve' : 'Long Sleeve'} Size {jersey_po?.ukuran} ({jersey_po?.qty}x)
              </span>
            </div>

            {/* QRIS Statis Image - Clean & Prominent without badge */}
            <div className="text-center py-2">
              <p className="text-xs font-bold text-slate-800 mb-3">Scan Kode QRIS Statis Panitia:</p>
              <div className="flex justify-center">
                <img
                  src={`${settings?.qris_image_url || '/qris-peaderal.png'}?v=20260908`}
                  alt="QRIS Statis Panitia"
                  className="w-64 sm:w-72 md:w-80 h-auto mx-auto block rounded-xl shadow-sm border border-slate-100"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-3 font-medium">
                Bisa di-scan dari aplikasi BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, Dana, LinkAja.
              </p>
            </div>

            {/* Rekening Transfer */}
            <div className="p-4 bg-brand-iceBg rounded-xl border border-brand-sky/30 text-xs space-y-1.5">
              <span className="font-bold text-slate-700 block">Transfer Manual Bank:</span>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 gap-2">
                <span className="font-mono font-bold text-brand-royal text-xs sm:text-sm truncate">
                  {settings?.nama_bank} {settings?.nomor_rekening}
                </span>
                <button
                  onClick={handleCopyRekening}
                  className="flex-shrink-0 text-xs bg-brand-royal/10 text-brand-royal font-bold px-2 py-1 rounded flex items-center space-x-1 hover:bg-brand-royal/20"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
              <span className="text-slate-500 block font-medium">a.n {settings?.nama_pemilik_rekening}</span>
            </div>
          </div>

          {/* Right: Upload Bukti Transfer */}
          <div className="bg-white p-6 rounded-3xl border border-brand-sky/40 shadow-card space-y-4">
            <h2 className="font-bold text-slate-800 text-base border-b pb-2">Konfirmasi &amp; Upload Bukti Transfer</h2>

            {status === 'lunas' ? (
              <div className="p-6 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-extrabold text-lg">Pembayaran Anda Telah LUNAS!</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Terima kasih atas partisipasi dan kontribusi donasi Anda. Nama Anda kini telah tercatat dengan badge emas di Wall of Heroes!
                </p>
                <div className="pt-3">
                  <Link
                    href={`/terima-kasih?code=${nomorRegistrasi}`}
                    className="inline-flex items-center justify-center bg-brand-royal hover:bg-brand-royalDark text-white text-xs font-bold px-5 py-3 rounded-xl shadow space-x-1.5"
                  >
                    <span>Unduh Nomor BIB Digital Anda</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadBukti} action="#" className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Setelah melakukan pembayaran, silakan pilih foto / screenshot bukti transfer Anda di bawah ini agar diverifikasi manual oleh admin (Rudeboys &amp; PEADERAL).
                </p>

                {/* File Upload Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Foto / Screenshot Bukti Transfer
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-navy file:text-white hover:file:bg-brand-royal cursor-pointer border rounded-xl p-1.5 border-slate-200"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Format JPG, PNG (Maks. 5MB)</p>
                </div>

                {/* Preview Selected File */}
                {filePreview && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] font-bold text-slate-600 block mb-2">Pratinjau Bukti Transfer:</span>
                    <img
                      src={filePreview}
                      alt="Pratinjau Bukti Transfer"
                      className="max-h-48 mx-auto rounded-lg shadow-sm object-contain"
                    />
                  </div>
                )}

                {/* Or URL input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Atau Masukkan URL / Link Bukti Transfer
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={buktiInput.startsWith('data:') ? '(File Gambar Dipilih)' : buktiInput}
                    onChange={(e) => {
                      setBuktiInput(e.target.value);
                      setFilePreview(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-royal"
                  />
                </div>

                {/* Consent No Refund Checkbox (Epic B2 AC) */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={consentNoRefund}
                      onChange={(e) => setConsentNoRefund(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-brand-yellow rounded border-slate-300 focus:ring-brand-yellow"
                    />
                    <span className="text-[11px] text-slate-700 leading-snug">
                      Saya memahami dan menyetujui bahwa <strong>tidak ada refund</strong> untuk PO Jersey Amal yang sudah dibayar, karena seluruh hasil dialokasikan utuh untuk donasi sepeda.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-brand-navy hover:bg-brand-royalDark text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-brand-yellow" />
                  <span>{uploading ? 'Mengunggah Bukti Transfer...' : 'Kirim Bukti Transfer'}</span>
                </button>

                <div className="pt-3 border-t text-[11px] text-slate-500 space-y-1.5">
                  <p>• Admin memverifikasi manual maksimal 1x24 jam setelah bukti diunggah.</p>
                  <p className="flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>Konfirmasi WA Panitia: </span>
                    <a
                      href={`https://wa.me/${settings?.kontak_wa_panitia || '6281298765432'}?text=${encodeURIComponent(`Halo Panitia, saya sudah transfer PO Jersey Tour de Gunung Batu dengan No. Registrasi ${nomorRegistrasi}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 font-bold underline"
                    >
                      Kirim Pesan WhatsApp
                    </a>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* View BIB Card Link */}
        <div className="text-center pt-4">
          <Link
            href={`/terima-kasih?code=${nomorRegistrasi}`}
            className="inline-flex items-center text-xs font-bold text-brand-royal hover:underline space-x-1"
          >
            <span>Lihat Kartu Nomor BIB Digital Anda</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
