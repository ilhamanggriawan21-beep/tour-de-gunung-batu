import React from 'react';
import TopoBackground from '@/components/TopoBackground';
import Accordion from '@/components/Accordion';
import { HelpCircle, PhoneCall, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const faqList = [
    {
      id: 'faq-1',
      question: 'Apakah event Tour de Gunung Batu 2026 ini dipungut biaya pendaftaran?',
      answer: 'Sama sekali TIDAK (100% GRATIS). Anda bisa mendaftar lewat alur "Daftar Saja" tanpa mengeluarkan biaya sepeser pun.'
    },
    {
      id: 'faq-2',
      question: 'Mengapa ada opsi Pre-Order (PO) Jersey dan ke mana uangnya disalurkan?',
      answer: 'PO Jersey adalah satu-satunya wadah penggalangan dana amal untuk event ini. 100% keuntungan bersih dari penjualan jersey resmi akan disalurkan oleh pergerakan PEADERAL dalam bentuk sepeda untuk anak yatim/piatu & dhuafa.'
    },
    {
      id: 'faq-3',
      question: 'Mengapa pembayaran PO Jersey menggunakan QRIS Statis & Transfer Manual (tanpa payment gateway otomatis)?',
      answer: 'Agar dana donasi Anda tidak terpotong biaya platform/vendor pihak ketiga (yang biasanya memotong 5–7% per transaksi). Dengan QRIS Statis & transfer manual panitia, 100% dana yang Anda transfer utuh masuk ke rekening donasi.'
    },
    {
      id: 'faq-4',
      question: 'Apakah PO Jersey yang sudah dibayar dapat dibatalkan atau di-refund?',
      answer: 'TIDAK BISA (No Refund). Semua dana PO Jersey yang masuk langsung dialokasikan untuk biaya produksi jersey dan pembelian unit sepeda donasi.'
    },
    {
      id: 'faq-5',
      question: 'Jika awalnya saya memilih "Daftar Saja", bisakah saya menyusul ikut PO Jersey belakangan?',
      answer: 'BISA! Anda dapat mengunjungi halaman "Susulan PO Jersey", masukkan Nomor Registrasi (contoh: TDGB-12345) atau No. Telepon Anda untuk memilih jersey tanpa perlu mengisi ulang data pribadi dari nol sebelum 20 September 2026.'
    },
    {
      id: 'faq-6',
      question: 'Berapa lama status pembayaran PO Jersey saya terverifikasi menjadi "Lunas"?',
      answer: 'Setelah Anda mengunggah bukti transfer, 2 admin panitia (Rudeboys & PEADERAL) akan mencocokkan nominal mutasi dan memverifikasi status secara manual dalam waktu maksimal 1x24 jam.'
    },
    {
      id: 'faq-7',
      question: 'Bagaimana cara memilih antara ambil langsung vs dikirim via ekspedisi?',
      answer: 'Saat mengisi form PO Jersey, Anda bisa memilih "Ambil Langsung" (diambil di titik kumpul pada hari-H event) atau "Dikirim" (di mana Anda mengisi alamat pengiriman dan ongkos kirim ditanggung oleh pembeli).'
    },
    {
      id: 'faq-8',
      question: 'Apa maksud dari "Self-Supported Event" (Event Mandiri)?',
      answer: 'Artinya seluruh peserta wajib mandiri dalam hal keselamatan, kebugaran, fisik, sepeda, dan perlengkapan reparasi. Panitia menyediakan petunjuk rute, namun tidak ada sweeper mobil evakuasi khusus.'
    },
    {
      id: 'faq-9',
      question: 'Di mana saya bisa mengunduh file GPX rute event?',
      answer: 'File GPX rute akan dirilis resmi pada H-1 event (26 September 2026) di website ini demi menjaga sterilisasi jalur event.'
    },
    {
      id: 'faq-10',
      question: 'Apakah pemakaian Nomor BIB Digital wajib dipasang saat event berlangsung?',
      answer: 'Pemakaian Nomor BIB bersifat opsional sebagai kenang-kenangan dan identitas sosial. Tidak ada check-in QR code wajib di lokasi.'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative bg-brand-iceBg">
      <TopoBackground />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-brand-royal font-bold text-xs uppercase bg-brand-royal/10 px-3.5 py-1 rounded-full mb-2">
            <HelpCircle className="w-4 h-4 text-brand-royal" />
            <span>Pusat Bantuan & Pertanyaan Umum</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-navy font-display">
            FREQUENTLY ASKED QUESTIONS (FAQ)
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Temukan jawaban cepat seputar pendaftaran, PO Jersey, dan aturan event di sini.
          </p>
        </div>

        {/* Accordion List */}
        <Accordion items={faqList} />

        {/* Bottom CTA */}
        <div className="bg-white p-6 rounded-3xl border border-brand-sky/40 text-center shadow-card space-y-3">
          <h3 className="font-bold text-brand-navy text-lg">Masih Punya Pertanyaan Lain?</h3>
          <p className="text-xs text-slate-500">Hubungi panitia resmi PEADERAL x Rudeboys Cyclist via WhatsApp.</p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/6287745870767?text=Halo%20Panitia%20Tour%20de%20Gunung%20Batu%2C%20saya%20ingin%20bertanya"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow text-sm space-x-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Chat WhatsApp: +62 877-4587-0767 (Rangga Rudeboys)</span>
            </a>
            <Link
              href="/daftar"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-brand-royal text-white font-bold px-6 py-3 rounded-xl shadow text-sm space-x-2"
            >
              <span>Lanjut ke Pendaftaran Event</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
