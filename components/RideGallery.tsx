'use client';

import React, { useRef } from 'react';
import { Camera, ChevronLeft, ChevronRight, MapPin, Instagram, Sparkles } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  kmBadge: string;
  image?: string;
  vibeText: string;
  tagClass: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'spot-1',
    title: 'Tugu Tegar Beriman',
    subtitle: 'Titik Kumpul & Pelepasan Roll Out',
    kmBadge: 'KM 0.0 • START',
    image: '/images/gambar_gunung.jpg',
    vibeText: 'Udara pagi Jonggol yang sejuk dengan briefing & doa bersama sebelum on saddle.',
    tagClass: 'bg-emerald-600 text-white'
  },
  {
    id: 'spot-2',
    title: 'Lembah Hijau Sukamakmur',
    subtitle: 'Panorama Sawah & Sungai Asri',
    kmBadge: 'KM 12.5 • SCENIC',
    vibeText: 'Jalanan aspal rolling diapit hamparan sawah hijau pegunungan Bogor Timur.',
    tagClass: 'bg-brand-royal text-white'
  },
  {
    id: 'spot-3',
    title: 'Tanjakan Kopi Catang',
    subtitle: 'Spot Uji Nyali Tanjakan Curam',
    kmBadge: 'KM 18.5 • MAX 16%',
    vibeText: 'Sektor tanjakan paling menantang. Gowes kompak saling semangati sesama cyclist.',
    tagClass: 'bg-rose-600 text-white'
  },
  {
    id: 'spot-4',
    title: 'Puncak Kaki Gunung Batu',
    subtitle: 'Finish Line & View Batu Megah',
    kmBadge: 'KM 22.6 • FINISH',
    image: '/images/gambar_gunung.jpg',
    vibeText: 'Pemandangan dinding tebing batu eksotis yang menjulang tinggi di garis akhir.',
    tagClass: 'bg-brand-yellow text-brand-navy font-black'
  },
  {
    id: 'spot-5',
    title: 'Solidaritas Cyclist',
    subtitle: 'PEADERAL x Rudeboys Cyclist',
    kmBadge: 'KOMUNITAS • AMAL',
    vibeText: 'Gowes bareng mandiri, kebersamaan tanpa sekat, dan berbagi sepeda untuk yatim dhuafa.',
    tagClass: 'bg-brand-navy text-brand-yellow font-bold border border-brand-yellow/40'
  }
];

export default function RideGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-brand-sky/30 shadow-card relative overflow-hidden">
      {/* Header Bar (Matching Original Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div className="text-center sm:text-left space-y-2">
          <div className="inline-flex items-center space-x-2 text-brand-royal font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-brand-royal/10 px-3 py-1 rounded-full">
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-royal" />
            <span>Dokumentasi &amp; Spot Ikonik</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy font-display leading-tight">
            Galeri Spot Jalur Gowes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
            Intip keindahan jalur gowes Jonggol hingga kaki Gunung Batu. Foto dokumentasi resmi hari-H akan diperbarui langsung di sini!
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center justify-center sm:justify-end space-x-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-xl border border-brand-sky/40 bg-brand-iceBg hover:bg-brand-sky/20 flex items-center justify-center text-brand-royal shadow-sm transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-xl border border-brand-sky/40 bg-brand-iceBg hover:bg-brand-sky/20 flex items-center justify-center text-brand-royal shadow-sm transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {GALLERY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-brand-iceBg rounded-2xl border border-brand-sky/30 shadow-sm overflow-hidden group hover:shadow-card transition-all duration-300 flex flex-col"
          >
            {/* Visual Frame */}
            <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-gradient-to-b from-brand-navy to-brand-navyLight flex items-center justify-center">
              {item.image ? (
                <>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/30 to-transparent" />
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brand-yellow border border-white/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white/90 block">Foto Segera Diunggah</span>
                  <span className="text-[10px] text-white/60 block">Drop foto ke /public/images/gallery/</span>
                </div>
              )}

              {/* Badge KM / Segment */}
              <div className="absolute top-3 left-3">
                <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-md ${item.tagClass}`}>
                  {item.kmBadge}
                </span>
              </div>

              {/* Shutter Icon */}
              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md p-1.5 rounded-full text-white/80">
                <Camera className="w-3.5 h-3.5" />
              </div>

              {/* Bottom Title on Image */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-extrabold text-base leading-tight drop-shadow">
                  {item.title}
                </h3>
                <p className="text-[11px] text-brand-yellow font-semibold">{item.subtitle}</p>
              </div>
            </div>

            {/* Description Body */}
            <div className="p-4 flex-1 flex flex-col justify-between bg-white">
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.vibeText}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-brand-royal" /> Jonggol Route
                </span>
                <span className="text-brand-royal font-bold">#TourDeGunungBatu</span>
              </div>
            </div>
          </div>
        ))}

        {/* IG Community Card (Unified in signature Navy + Yellow glow style) */}
        <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-gradient-to-b from-brand-navy via-brand-navyLight to-brand-royalDark rounded-2xl p-6 text-white border-2 border-brand-yellow/60 shadow-glow flex flex-col justify-between">
          <div>
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brand-yellow mb-3 border border-white/15">
              <Instagram className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase bg-brand-yellow/20 text-brand-yellow px-2.5 py-0.5 rounded-full inline-block mb-2">
              Share Your Story
            </span>
            <h3 className="text-lg font-extrabold font-display leading-tight mb-2 text-white">
              Tag @rudeboyscyclist &amp; @peaderal
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Punya foto latihan atau survei rute? Tag kami di Instagram dengan hashtag <strong>#TourDeGunungBatu2026</strong> untuk kami repost!
            </p>
          </div>

          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noreferrer"
            className="mt-4 w-full bg-gradient-to-r from-brand-yellow to-amber-400 text-brand-navy font-extrabold text-xs py-3 rounded-xl text-center shadow-glow hover:scale-105 transition-all block"
          >
            Buka Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
