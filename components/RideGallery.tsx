'use client';

import React, { useRef } from 'react';
import { Camera, ChevronLeft, ChevronRight, MapPin, Instagram, Sparkles, Image as ImageIcon } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  kmBadge: string;
  image?: string;
  vibeText: string;
  tagColor: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'spot-1',
    title: 'Tugu Tegar Beriman',
    subtitle: 'Titik Kumpul & Pelepasan Roll Out',
    kmBadge: 'KM 0.0 • START',
    image: '/images/gambar_gunung.jpg',
    vibeText: 'Udara pagi Jonggol yang sejuk dengan briefing & doa bersama',
    tagColor: 'bg-emerald-500'
  },
  {
    id: 'spot-2',
    title: 'Lembah Hijau Sukamakmur',
    subtitle: 'Panorama Sawah & Sungai Asri',
    kmBadge: 'KM 12.5 • SCENIC',
    vibeText: 'Jalanan aspal mulus diapit hamparan sawah hijau dan perbukitan',
    tagColor: 'bg-brand-royal'
  },
  {
    id: 'spot-3',
    title: 'Tanjakan Kopi Catang',
    subtitle: 'Spot Uji Nyali Tanjakan Curam',
    kmBadge: 'KM 18.5 • MAX 16%',
    vibeText: 'Sensasi nanjak penuh keringat bersama teman se-hobi',
    tagColor: 'bg-rose-500'
  },
  {
    id: 'spot-4',
    title: 'Puncak Kaki Gunung Batu',
    subtitle: 'Finish Line & View Batu Megah',
    kmBadge: 'KM 22.6 • FINISH',
    image: '/images/gambar_gunung.jpg',
    vibeText: 'Pemandangan tebing batu eksotis yang menjulang tinggi',
    tagColor: 'bg-brand-yellow text-brand-navy'
  },
  {
    id: 'spot-5',
    title: 'Brotherhood & Solidaritas',
    subtitle: 'PEADERAL x Rudeboys Cyclist',
    kmBadge: 'COMMUNITY • CHARITY',
    vibeText: 'Gowes bareng, saling tarik, saling support hingga garis finish',
    tagColor: 'bg-amber-500'
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
    <div className="w-full">
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
        <div>
          <div className="inline-flex items-center space-x-2 text-brand-royal font-bold text-xs uppercase tracking-wider bg-brand-royal/10 px-3 py-1 rounded-full mb-2">
            <Camera className="w-3.5 h-3.5 text-brand-royal" />
            <span>Dokumentasi &amp; Spot Ikonik</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy font-display">
            Vibe Gowes &amp; Spot Rute
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Intip keindahan jalur gowes Jonggol hingga kaki Gunung Batu. Foto dokumentasi lengkap hasil event akan di-upload langsung di sini!
          </p>
        </div>

        {/* Scroll Nav Buttons */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-sm transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-sm transition-all"
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
            className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-white rounded-3xl border border-brand-sky/30 shadow-card overflow-hidden group hover:shadow-glow transition-all duration-300 flex flex-col"
          >
            {/* Visual Frame */}
            <div className="h-48 sm:h-52 w-full relative overflow-hidden bg-gradient-to-br from-brand-navy via-slate-800 to-brand-royalDark flex items-center justify-center">
              {item.image ? (
                <>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brand-yellow border border-white/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white/90 block">Foto Rute Segera Ditambahkan</span>
                  <span className="text-[10px] text-white/60 block">Drop foto ke /public/images/gallery/</span>
                </div>
              )}

              {/* Badge KM / Segment */}
              <div className="absolute top-3 left-3">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-white shadow-md ${item.tagColor}`}>
                  {item.kmBadge}
                </span>
              </div>

              {/* Shutter Icon */}
              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md p-1.5 rounded-full text-white/80">
                <Camera className="w-3.5 h-3.5" />
              </div>

              {/* Bottom Title on Image */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-extrabold text-base sm:text-lg leading-tight drop-shadow-md">
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

        {/* IG Submission Card */}
        <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-gradient-to-br from-purple-700 via-rose-600 to-amber-500 rounded-3xl p-6 text-white shadow-card flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4">
              <Instagram className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black uppercase bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
              Share Your Story
            </span>
            <h3 className="text-xl font-extrabold font-display leading-tight mb-2">
              Tag @rudeboyscyclist &amp; @peaderal
            </h3>
            <p className="text-xs text-white/90 leading-relaxed">
              Punya foto survey rute atau momen latihan? Mention kami di Instagram Story atau feed dengan hashtag <strong>#TourDeGunungBatu2026</strong>!
            </p>
          </div>

          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noreferrer"
            className="mt-4 w-full bg-white text-rose-600 font-extrabold text-xs py-3 rounded-xl text-center hover:bg-slate-100 transition-all shadow-md block"
          >
            Buka Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
