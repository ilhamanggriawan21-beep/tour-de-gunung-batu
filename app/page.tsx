import React from 'react';
import Link from 'next/link';
import TopoBackground from '@/components/TopoBackground';
import CountdownTimer from '@/components/CountdownTimer';
import SizeChart from '@/components/SizeChart';
import PeaderalImpactGallery from '@/components/PeaderalImpactGallery';
import {
  Bike,
  Heart,
  ShieldCheck,
  MapPin,
  Calendar,
  Mountain,
  ArrowRight,
  Users,
  Shirt,
  Award,
  Download
} from 'lucide-react';
import { getSettings, getWallOfHeroesData } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Dynamic server render

export default async function HomePage() {
  const settings = await getSettings();
  const heroData = await getWallOfHeroesData();

  return (
    <div className="relative bg-brand-iceBg min-h-screen overflow-hidden">
      {/* Dynamic Topographic Background */}
      <TopoBackground />

      {/* HERO SECTION — Gunung Batu Photo Banner with Blue Gradient Overlay */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-white overflow-hidden">
        {/* Background: Gunung Batu Photo */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/gambar_gunung.jpg"
            alt="Gunung Batu Jonggol"
            className="w-full h-full object-cover object-center"
          />
          {/* Blue Gradient Overlay — Logo harus terlihat */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/85 via-brand-navy/70 to-brand-navy/95"></div>
          {/* Extra bottom fade for smooth transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-navy to-transparent"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 py-10 sm:py-16">
          
          {/* Presenter Intro Line */}
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm md:text-base font-bold text-white tracking-[0.2em] sm:tracking-[0.25em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              PEADERAL x RUDEBOYS 2026 PRESENT :
            </p>
          </div>

          {/* 
            LOGO EVENT — BESAR sebagai banner utama identitas event.
            Logo ini biru gelap + kuning di atas background putih (PNG).
            Agar terlihat di atas gradasi biru gelap, kita beri glow putih.
          */}
          <div className="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8">
            <img
              src="/images/logo_event.png"
              alt="TOUR DE GUNUNG BATU — Logo Utama Event"
              className="w-full h-auto object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.35)] hover:drop-shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-500"
            />
          </div>

          {/* Logo Kolaborasi Peaderal x Rudeboys — kecil di bawah logo utama */}
          <div className="flex items-center justify-center mb-5 sm:mb-6">
            <img
              src="/images/logo_peaderal_x_rudeboys.png"
              alt="Logo PEADERAL x Rudeboys"
              className="max-h-8 sm:max-h-10 md:max-h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(244,199,22,0.5)]"
            />
          </div>

          <p className="max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base text-white/85 font-medium leading-relaxed mb-6 sm:mb-8 px-2">
            Event bersepeda mandiri (<em className="text-white font-semibold">self-supported</em>). Pendaftaran 100% GRATIS. Seluruh hasil pre-order jersey resmi disalurkan menjadi sepeda untuk anak yatim/piatu &amp; dhuafa.
          </p>

          {/* Key Event Info Pills — Date & Location */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 text-xs sm:text-sm font-bold px-2">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/20 text-brand-yellow w-full sm:w-auto justify-center">
              <Calendar className="w-4 h-4 text-brand-yellow flex-shrink-0" />
              <span>Minggu, 27 Sept 2026</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/20 text-white w-full sm:w-auto justify-center">
              <MapPin className="w-4 h-4 text-brand-sky flex-shrink-0" />
              <span>Tugu Tegar Beriman → Gunung Batu</span>
            </div>
          </div>

          {/* Route Stats — Large Display Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg sm:max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-3 sm:p-5 text-center flex flex-col items-center justify-center">
              <Bike className="w-5 h-5 sm:w-7 sm:h-7 text-brand-sky mb-1 sm:mb-2" />
              <span className="text-2xl sm:text-4xl font-black text-white font-display leading-none">22.6</span>
              <span className="text-[10px] sm:text-xs font-bold text-brand-sky uppercase tracking-wider mt-1">KM Total</span>
            </div>
            <div className="bg-brand-yellow/20 backdrop-blur-md rounded-2xl border border-brand-yellow/40 p-3 sm:p-5 text-center flex flex-col items-center justify-center">
              <Mountain className="w-5 h-5 sm:w-7 sm:h-7 text-brand-yellow mb-1 sm:mb-2" />
              <span className="text-2xl sm:text-4xl font-black text-brand-yellow font-display leading-none">700<span className="text-base sm:text-xl">m</span></span>
              <span className="text-[10px] sm:text-xs font-bold text-brand-yellow/80 uppercase tracking-wider mt-1">Elevation Gain</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-3 sm:p-5 text-center flex flex-col items-center justify-center">
              <Award className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-400 mb-1 sm:mb-2" />
              <span className="text-2xl sm:text-4xl font-black text-white font-display leading-none">FREE</span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider mt-1">Pendaftaran</span>
            </div>
          </div>

          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
            <Link
              href="/daftar"
              className="w-full sm:w-auto bg-gradient-to-r from-brand-yellow to-amber-400 text-brand-navy text-base sm:text-lg font-extrabold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-glow hover:scale-105 transition-all flex items-center justify-center space-x-2 sm:space-x-3 animate-pulse-glow"
            >
              <Bike className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Daftar Sekarang (Gratis)</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link
              href="/wall-of-heroes"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/30 text-base sm:text-lg font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl backdrop-blur-sm transition-all flex items-center justify-center space-x-2 sm:space-x-3"
            >
              <Users className="w-5 h-5 text-brand-yellow" />
              <span>Wall of Heroes ({heroData.total_peserta} Peserta)</span>
            </Link>
          </div>

          {/* Countdown Component */}
          <div className="mt-10 sm:mt-12 max-w-4xl mx-auto">
            <CountdownTimer
              poDeadlineStr={settings.tanggal_tutup_po}
              regDeadlineStr={settings.tanggal_tutup_pendaftaran}
            />
          </div>
        </div>
      </section>

      {/* STORYTELLING AMAL & OFFICIAL JERSEY DISPLAY */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-brand-sky/30 shadow-card relative overflow-hidden">
          <div className="text-center max-w-2xl sm:max-w-3xl mx-auto mb-6 sm:mb-8 space-y-2 sm:space-y-3">
            <div className="inline-flex items-center space-x-2 text-brand-royal font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-brand-royal/10 px-3 py-1 rounded-full">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 fill-rose-500" />
              <span>Official Jersey &amp; Misi PEADERAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy font-display leading-tight">
              Official Jersey Pre-Order
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed px-2">
              Dibuat dengan tema biru royal, garis pola topografi pegunungan, dan aksen kuning keemasan. 100% keuntungan bersih dari pre-order jersey disalurkan utuh tanpa potongan fee platform oleh pergerakan <strong className="text-brand-royal">PEADERAL</strong> untuk membelikan sepeda anak yatim/piatu &amp; dhuafa.
            </p>
          </div>

          {/* OFFICIAL JERSEY DESIGN IMAGE FRAME */}
          <div className="relative max-w-3xl sm:max-w-4xl mx-auto bg-gradient-to-b from-brand-navy via-brand-navyLight to-brand-royalDark p-3 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-brand-yellow/70 shadow-glow mb-6 sm:mb-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-white text-[10px] sm:text-xs font-bold mb-2 sm:mb-3 px-1 sm:px-2 gap-1">
              <span className="text-brand-yellow uppercase tracking-wider flex items-center">
                <Shirt className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-brand-yellow" />
                DESAIN RESMI JERSEY AMAL 2026
              </span>
              <span className="bg-white/10 text-brand-sky px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/15 text-[9px] sm:text-[11px]">
                Short &amp; Long Sleeve
              </span>
            </div>

            {/* Constrained Container for High Resolution Image */}
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-1 sm:p-2 flex items-center justify-center">
              <img
                src="/images/design_jersey.jpg?v=20260908"
                alt="Desain Official Jersey PEADERAL x RUDEBOYS"
                className="max-h-[280px] sm:max-h-[420px] md:max-h-[500px] w-auto h-auto object-contain mx-auto rounded-lg shadow-lg"
              />
            </div>

            <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/15 text-white">
                <span className="text-[10px] sm:text-xs text-brand-sky font-bold block uppercase">Short Sleeve</span>
                <span className="text-lg sm:text-2xl font-black text-brand-yellow font-display block mt-0.5 sm:mt-1">
                  Rp {settings.harga_short_sleeve.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/15 text-white">
                <span className="text-[10px] sm:text-xs text-brand-sky font-bold block uppercase">Long Sleeve</span>
                <span className="text-lg sm:text-2xl font-black text-brand-yellow font-display block mt-0.5 sm:mt-1">
                  Rp {settings.harga_long_sleeve.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              <Link
                href="/daftar"
                className="inline-flex items-center justify-center bg-gradient-to-r from-brand-yellow to-amber-400 text-brand-navy font-extrabold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-glow hover:scale-105 transition-all space-x-2"
              >
                <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-brand-navy" />
                <span>Pesan PO Jersey Sekarang</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>

          {/* Key Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 bg-brand-iceBg rounded-xl sm:rounded-2xl border border-brand-sky/30">
              <div className="flex items-center space-x-2 sm:space-x-3 text-brand-royal font-bold text-sm sm:text-base mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>0% Fee Payment Gateway</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Pembayaran langsung via QRIS Statis panitia &amp; transfer bank. Bebas biaya potongan vendor 5-7%, sehingga 100% dana utuh untuk amal.
              </p>
            </div>
            <div className="p-4 sm:p-5 bg-brand-iceBg rounded-xl sm:rounded-2xl border border-brand-sky/30">
              <div className="flex items-center space-x-2 sm:space-x-3 text-brand-royal font-bold text-sm sm:text-base mb-1">
                <Award className="w-5 h-5 text-brand-yellow flex-shrink-0" />
                <span>Nama Emas di Wall of Heroes</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Setiap pemesan jersey yang terverifikasi Lunas akan ditampilkan dengan warna emas keemasan di halaman transparansi publik Wall of Heroes.
              </p>
            </div>
          </div>

          {/* PEADERAL BIKE DONATION REAL IMPACT REELS GALLERY */}
          <PeaderalImpactGallery />
        </div>
      </section>

      {/* OFFICIAL JERSEY SIZE CHART SECTION */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <SizeChart />
      </section>

      {/* SUSULAN PO JERSEY CTA BANNER */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-brand-royalDark to-brand-navy rounded-2xl p-5 sm:p-6 md:p-8 text-white border border-brand-yellow/40 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-glow">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-brand-yellow font-display leading-tight">
              Sudah daftar tapi belum ikut PO Jersey?
            </h3>
            <p className="text-xs sm:text-sm text-white/70">
              Anda bisa menyusul ikut PO Jersey amal kapan saja sebelum 20 September tanpa perlu mengulang data pribadi!
            </p>
          </div>
          <Link
            href="/susulan-po"
            className="whitespace-nowrap bg-white/10 hover:bg-white/20 text-brand-yellow border border-brand-yellow font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all text-xs sm:text-sm flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <span>Susulan PO di Sini</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* EVENT DETAILS & ROUTE INFO */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-display">Informasi Rute &amp; Pelaksanaan</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Acara gowes bersama dengan semangat kebersamaan dan kedisiplinan mandiri.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-sky/30 shadow-card">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-royal/10 flex items-center justify-center text-brand-royal mb-3 sm:mb-4">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-brand-navy mb-2">Jadwal &amp; Jam Start</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Hari/Tanggal: <strong>Minggu, 27 September 2026</strong><br />
              Kumpul: <strong>07.00 WIB</strong><br />
              On Saddle (Roll Out): <strong>07.30 WIB Tepat</strong>
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-sky/30 shadow-card">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-royal/10 flex items-center justify-center text-brand-royal mb-3 sm:mb-4">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-brand-navy mb-2">Titik Kumpul &amp; Tujuan</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Titik Start: <strong>Tugu Tegar Beriman, Jonggol</strong><br />
              Tujuan Destinasi: <strong>Kaki Gunung Batu, Jonggol</strong><br />
              Jarak Rute: <strong>±22,6 KM (Start → Finish)</strong>
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-sky/30 shadow-card sm:col-span-2 md:col-span-1 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-royal/10 flex items-center justify-center text-brand-royal mb-3 sm:mb-4">
                <Mountain className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-brand-navy mb-2">Profil Rute &amp; Elevasi</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3">
                Elevation Gain: <strong>±700m (Start 87 mdpl → Puncak 632 mdpl)</strong><br />
                Sifat Event: <strong>Self-Supported (Mandiri)</strong>
              </p>
            </div>
            <div className="mt-2 flex items-start space-x-2 bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl text-[11px] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>File GPX rute akan dibagikan resmi pada H-1 (26 Sept 2026) demi menjaga sterilisasi jalur event.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
