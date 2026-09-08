import React from 'react';
import TopoBackground from '@/components/TopoBackground';
import {
  ShieldCheck,
  AlertTriangle,
  Bike,
  Clock,
  MapPin,
  PhoneCall,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Wrench,
  Droplets,
  HeartPulse,
  Trash2,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function PeraturanPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative bg-brand-iceBg">
      <TopoBackground />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-brand-royal font-bold text-xs uppercase bg-brand-royal/10 px-3.5 py-1 rounded-full mb-2">
            <ShieldCheck className="w-4 h-4 text-brand-royal" />
            <span>Panduan &amp; Aturan Resmi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-navy font-display">
            PERATURAN &amp; WAIVER EVENT
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Harap dibaca dengan saksama oleh seluruh calon peserta Tour de Gunung Batu 2026.
          </p>
        </div>

        {/* Highlight Banner: Self-Supported */}
        <div className="bg-gradient-to-r from-brand-navy to-brand-royalDark text-white p-6 rounded-3xl border-2 border-brand-yellow/60 shadow-glow space-y-3">
          <div className="flex items-center space-x-3 text-brand-yellow">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <h2 className="font-black text-lg font-display uppercase tracking-wide">
              Konsep Mandiri (Self-Supported Event)
            </h2>
          </div>
          <p className="text-sm text-brand-sky leading-relaxed">
            Tour de Gunung Batu 2026 adalah kegiatan bersepeda bersama berbasis kesadaran dan kemandirian penuh (<em className="text-white">self-supported ride</em>). Panitia tidak menyediakan mobil evakuasi (sweeper) berbayar maupun pengawalan ketat secara profesional. Setiap pesepeda wajib menjaga keselamatan diri dan perlengkapan masing-masing.
          </p>
        </div>

        {/* QUICK RULES: DO'S & DON'TS (Visual Gen-Z Friendly Cards) */}
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-brand-navy font-display flex items-center justify-center sm:justify-start gap-2">
              <Zap className="w-6 h-6 text-brand-yellow fill-brand-yellow" />
              <span>Quick Rules (10 Detik Paham)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Ringkasan hal wajib dan larangan utama demi keamanan &amp; kelancaran gowes bareng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* DO'S CARD (WAJIB BAWA & PATUHI) */}
            <div className="bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/30 shadow-card">
              <div className="flex items-center space-x-2.5 text-emerald-700 font-extrabold text-base sm:text-lg mb-4 pb-3 border-b border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <span>WAJIB DIBAWA / DIPATUHI</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-emerald-200">
                  <span className="text-xl flex-shrink-0">🪖</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Helm Standar Keselamatan</strong>
                    <span className="text-slate-500 text-[11px] sm:text-xs">Wajib terkunci di kepala selama di atas sepeda. No helmet, no ride.</span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-emerald-200">
                  <span className="text-xl flex-shrink-0">🛠️</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Toolkit &amp; Ban Dalam Cadangan</strong>
                    <span className="text-slate-500 text-[11px] sm:text-xs">Pompa/CO2, sendok ban (tire lever), dan ban dalam sesuai ukuran roda.</span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-emerald-200">
                  <span className="text-xl flex-shrink-0">💧</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">2 Bidon Air &amp; Nutrisi Cukup</strong>
                    <span className="text-slate-500 text-[11px] sm:text-xs">Jalur nanjak elevasi 700m membakar energi tinggi, jangan sampai dehidrasi.</span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-emerald-200">
                  <span className="text-xl flex-shrink-0">🚲</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Sepeda Kondisi Prima</strong>
                    <span className="text-slate-500 text-[11px] sm:text-xs">Cek rem pakem, gear shifting lancar, dan tekanan ban sebelum hari H.</span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-emerald-200">
                  <span className="text-xl flex-shrink-0">🆔</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Kartu Identitas &amp; Uang Tunai</strong>
                    <span className="text-slate-500 text-[11px] sm:text-xs">KTP/SIM dan cash secukupnya untuk logistik warung di rute Jonggol.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* DON'TS CARD (DILARANG & PERINGATAN) */}
            <div className="bg-gradient-to-b from-rose-500/10 to-rose-500/5 rounded-3xl p-5 sm:p-6 border-2 border-rose-500/30 shadow-card">
              <div className="flex items-center space-x-2.5 text-rose-700 font-extrabold text-base sm:text-lg mb-4 pb-3 border-b border-rose-500/20">
                <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                <span>DILARANG / HINDARI</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-rose-200">
                  <span className="text-xl flex-shrink-0">🏁</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Bukan Ajang Balapan (No Racing)</strong>
                    <span className="text-slate-500 text-[11px] sm:text-xs">Ini gowes kebersamaan. Jangan ugal-ugalan atau melanggar rambu jalan.</span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-rose-200">
                  <span className="text-xl flex-shrink-0">🚯</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Dilarang Membuang Sampah Sembarangan</strong>
                    <span className="text-slate-500 text-[11px] sm:text-xs">Bungkus gel, botol plastik, dan tisu wajib dikantongi sendiri.</span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-rose-200">
                  <span className="text-xl flex-shrink-0">⚠️</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Jangan Paksakan Diri</strong>
                    <span className="text-slate-500 text-[11px] sm:text-xs">Prinsip utama: <em>"Yakin Lanjut, Ragu Putar Balik"</em>. Keselamatan nomor 1.</span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-rose-200">
                  <span className="text-xl flex-shrink-0">🚫</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Tidak Ada Mobil Sweeper / Evakuasi Khusus</strong>
                    <span className="text-slate-500 text-[11px] sm:text-xs">Event bersifat self-supported mandiri, saling tolong menolong sesama pesepeda.</span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-rose-200">
                  <span className="text-xl flex-shrink-0">🧭</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Jangan Memotong Jalur Resmi</strong>
                    <span className="text-slate-500 text-[11px] sm:text-xs">Tetap ikuti rute GPX resmi demi keselamatan dan memudahkan koordinasi.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content Sections (Legal / Waiver Detail) */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-brand-sky/40 shadow-card space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Section 1: Jadwal & Lokasi */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-brand-navy flex items-center space-x-2 border-b pb-2">
              <Clock className="w-5 h-5 text-brand-royal" />
              <span>1. Jadwal &amp; Titik Kumpul</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li><strong>Hari / Tanggal:</strong> Minggu, 27 September 2026</li>
              <li><strong>Titik Kumpul:</strong> Tugu Tegar Beriman, Jonggol</li>
              <li><strong>Jam Kumpul & Briefing:</strong> 07.00 WIB</li>
              <li><strong>Jam Roll Out (On Saddle):</strong> 07.30 WIB Tepat (Tidak menunggu peserta terlambat)</li>
              <li><strong>Destinasi Rute:</strong> Kaki Gunung Batu, Jonggol (Jarak: ±22,6 KM Start → Finish, Elevation Gain ±700m)</li>
              <li className="pt-1 text-slate-600">
                <strong>File GPX Rute:</strong> Akan dibagikan resmi pada <strong>26 September 2026 (H-1 Event)</strong> demi menjaga sterilisasi jalur event.
              </li>
            </ul>
          </section>

          {/* Section 2: Peralatan Wajib */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-brand-navy flex items-center space-x-2 border-b pb-2">
              <Bike className="w-5 h-5 text-brand-royal" />
              <span>2. Kewajiban Peralatan & Sepeda</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>Wajib memakai <strong>Helm Sepeda Standar Keselamatan</strong> selama bersepeda.</li>
              <li>Membawa <strong>alat reparasi mandiri</strong> (ban dalam cadangan, pompa portabel, tire lever, multi-tool).</li>
              <li>Membawa perbekalan air (bidon) & nutrisi/snack yang cukup.</li>
              <li>Lampu depan & belakang sepeda dalam kondisi berfungsi baik.</li>
              <li>Membawa kartu identitas pribadi & uang tunai secukupnya untuk kebutuhan darurat di jalan.</li>
            </ul>
          </section>

          {/* Section 3: Pernyataan Waiver Risiko */}
          <section className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-brand-navy flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>3. Teks Resmi Waiver Pernyataan Risiko</span>
            </h3>
            <p className="italic text-slate-600 text-xs sm:text-sm bg-white p-4 rounded-xl border border-slate-200 leading-relaxed">
              "Saya memahami dan menyetujui bahwa Tour de Gunung Batu adalah kegiatan bersepeda mandiri (self-supported). Saya wajib membawa sepeda dan perlengkapan perbaikan sendiri. Panitia hanya menyediakan rute dan penunjuk arah di persimpangan/tikungan, tidak wajib finish, dan setiap peserta berhak memutuskan untuk melanjutkan atau kembali sesuai kondisi masing-masing ('yakin lanjut, ragu putar balik'). Segala risiko keselamatan selama kegiatan menjadi tanggung jawab pribadi peserta."
            </p>
          </section>

          {/* Section 4: Kebijakan Jersey & Pengiriman */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-brand-navy flex items-center space-x-2 border-b pb-2">
              <MapPin className="w-5 h-5 text-brand-royal" />
              <span>4. Kebijakan Pre-Order Jersey &amp; Pengiriman</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li><strong>Tidak Ada Refund:</strong> Seluruh PO Jersey yang sudah dibayar bersifat final dan tidak dapat dibatalkan, karena 100% keuntungan bersih disalurkan untuk donasi sepeda anak yatim/dhuafa oleh PEADERAL.</li>
              <li><strong>Ambil Langsung:</strong> Jersey dapat diambil langsung pada saat briefing di titik kumpul pada hari-H.</li>
              <li><strong>Dikirim via Ekspedisi:</strong> Paket dikirim menggunakan ekspedisi JNE/JNT, di mana ongkos kirim ditanggung oleh pembeli dan dikomunikasikan via WhatsApp oleh panitia.</li>
            </ul>
          </section>

          {/* Section 5: File GPX Rute & Kontak Darurat */}
          <section className="space-y-3 border-t pt-4">
            <h3 className="text-xl font-bold text-brand-navy flex items-center space-x-2 border-b pb-2">
              <PhoneCall className="w-5 h-5 text-brand-royal" />
              <span>5. File GPX Rute &amp; Kontak Darurat Panitia</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-brand-iceBg rounded-2xl border border-brand-sky/30">
                <span className="font-bold text-brand-navy text-sm block mb-1">File GPX Navigasi Rute</span>
                <p className="text-xs text-slate-500 mb-3">
                  File navigasi rute format .GPX untuk Garmin, Wahoo, Bryton, dan Strava akan dirilis resmi pada <strong>26 September 2026 (H-1 Event)</strong> demi menjaga sterilisasi rute event.
                </p>
                <span className="inline-block bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg cursor-not-allowed">
                  Tersedia 26 Sept 2026
                </span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="font-bold text-emerald-900 text-sm block mb-1">Kontak Darurat &amp; Info Panitia</span>
                <p className="text-xs text-slate-600 mb-3">
                  Untuk pertanyaan dan koordinasi darurat seputar event, silakan hubungi WhatsApp panitia resmi: <strong>+62 877-4587-0767 (Rangga Rudeboys)</strong>.
                </p>
                <a
                  href="https://wa.me/6287745870767?text=Halo%20Panitia%20Tour%20de%20Gunung%20Batu%202026"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>WhatsApp: +62 877-4587-0767 (Rangga Rudeboys)</span>
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 pb-6 w-full max-w-md sm:max-w-none mx-auto">
          <Link
            href="/daftar"
            className="w-full sm:w-auto bg-gradient-to-r from-brand-yellow to-amber-400 text-brand-navy font-extrabold px-6 sm:px-8 py-3.5 rounded-2xl shadow-glow hover:scale-105 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base text-center"
          >
            <span>Lanjut Pendaftaran Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/faq"
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 sm:px-8 py-3.5 rounded-2xl border border-slate-300 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base text-center shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-brand-royal" />
            <span>Lihat FAQ &amp; Tanya Jawab</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
