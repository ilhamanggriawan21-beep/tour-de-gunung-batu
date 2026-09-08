# PRODUCT REQUIREMENTS DOCUMENT

## TOUR DE GUNUNG BATU

*PEADERAL x Rudeboys Cyclist — Web Pendaftaran Event & PO Jersey Amal —
"Berbayar dengan Senyuman"*

**Tanggal Event: 27 September 2026**

Titik Kumpul: Tugu Tegar Beriman, Jonggol → Tujuan: Gunung Batu, Jonggol

On Saddle: 07.30 WIB | Jarak ±30 KM berangkat + ±30 KM pulang | EG
±1000m+

Domain: tour-de-gunung-batu.vercel.app

*Dokumen versi 4.3 — Revisi: pembayaran PO Jersey via QRIS statis +
verifikasi manual (tombol "Sudah Bayar"/"Batalkan Verifikasi", tanpa fee
platform); tambahan alur susulan PO Jersey, halaman Peraturan & FAQ,
Total Peserta/Partisipan Jersey + leaderboard komunitas di Wall of
Heroes, countdown timer, dan tombol share sosial; tambahan Story C2 —
pembedaan warna emas (partisipan PO Jersey) vs biru (peserta event saja)
di Wall of Heroes.*

## 1. Executive Summary

### 1.1 Latar Belakang & Masalah

Komunitas Rudeboys Cyclist, bersama pergerakan berbagi sepeda PEADERAL,
menyelenggarakan event gowes amal gratis "Tour de Gunung Batu" pada 27
September 2026. Event tidak memungut biaya pendaftaran; satu-satunya
sumber dana untuk donasi berasal dari pre-order (PO) jersey resmi event,
dengan seluruh keuntungan bersih disalurkan oleh pergerakan PEADERAL
dalam bentuk sepeda untuk anak yatim/piatu & dhuafa. Saat ini belum ada
sistem digital untuk mendata peserta, mengelola PO jersey, maupun
menampilkan transparansi publik siapa saja yang sudah berpartisipasi.

Karena tujuan akhirnya adalah donasi, panitia ingin proses pembayaran PO
Jersey bebas dari potongan biaya pihak ketiga apa pun — sehingga setiap
rupiah yang masuk dari pembeli benar-benar utuh sampai ke rekening
panitia sebelum disalurkan menjadi sepeda.

### 1.2 Solusi yang Diusulkan

Website pendaftaran event ringan (mobile-first) dengan dua alur utama —
"Daftar Saja" dan "Daftar + PO Jersey" — dilengkapi halaman publik "Wall
of Heroes", halaman pengaturan pembayaran yang dikelola mandiri oleh 2
admin (Rudeboys & PEADERAL), serta elemen storytelling yang menegaskan
bahwa PO jersey adalah kontribusi nyata untuk amal.

Pembayaran PO Jersey menggunakan QRIS statis milik panitia (satu kode
QRIS/nomor rekening tetap, bukan QRIS dinamis dari payment gateway
berbayar) yang ditampilkan di halaman pembayaran bersama nominal yang
harus ditransfer. Pembeli mengunggah bukti transfer, lalu admin
memverifikasi secara manual dan menekan tombol "Sudah Bayar" untuk
mengubah status pesanan menjadi "Lunas". Pendekatan ini sedikit menambah
langkah manual bagi admin, namun memastikan tidak ada potongan fee
payment gateway (biasanya ≈5–7%) — laporan dampak akhir tetap diumumkan
manual oleh PEADERAL/Rudeboys melalui Instagram.

Selain itu, peserta yang awalnya hanya memilih "Daftar Saja" tetap bisa
menyusul ikut PO Jersey belakangan tanpa mengisi ulang data pribadi dari
nol (lihat Epic F), admin bisa membatalkan verifikasi jika salah klik
(lihat Epic D), dan ditambahkan halaman Peraturan serta FAQ publik (Epic
G & H) plus elemen engagement ringan seperti countdown timer dan tombol
share (Epic I) — semua tetap mengikuti tema visual jersey yang sama.

### 1.3 Kriteria Sukses (Success Metrics)

- Website live dan dapat diakses publik di tour-de-gunung-batu.vercel.app
  selambat-lambatnya H-10 sebelum event (17 September 2026).

- 100% data peserta tersimpan terstruktur di database — 0% dikelola
  manual via chat pribadi setelah go-live.

- Form pendaftaran dapat diisi dan submit dalam waktu < 2 menit di
  perangkat mobile.

- Status pembayaran PO Jersey berubah menjadi "Lunas" maksimal dalam
  1x24 jam setelah bukti transfer diunggah dan diverifikasi manual oleh
  admin.

- 0% potongan fee payment gateway pada dana PO Jersey — 100% nominal
  yang ditransfer pembeli utuh masuk ke rekening/QRIS panitia.

- Peserta yang sudah "Daftar Saja" dapat menyusul ikut PO Jersey kapan
  saja sebelum 20 September 2026, tanpa perlu mengisi ulang
  Nama/Alamat/No. Telepon.

- PO Jersey otomatis tertutup tepat pada 20 September 2026 dan
  pendaftaran peserta otomatis tertutup pada 25 September 2026, tanpa
  perlu intervensi manual.

- 0% data sensitif (alamat, no. telepon, alamat pengiriman, bukti
  transfer) bocor ke halaman publik.

## 2. User Experience & Functionality

### 2.1 Persona Pengguna

| **Persona**                       | **Deskripsi**                                                                        | **Kebutuhan Utama**                                                                                                                          |
|-----------------------------------|--------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| Calon Peserta Umum                | Pesepeda dari berbagai komunitas/individu, event bersifat mandiri (self-supported).  | Daftar cepat, info rute/EG/jam jelas, paham risiko ditanggung sendiri.                                                                       |
| Calon Pembeli PO Jersey           | Peserta (atau non-peserta) yang ingin sekaligus donasi lewat beli jersey.            | Yakin uangnya utuh untuk amal (tanpa potongan fee), proses bayar & upload bukti jelas, opsi ambil/kirim jersey, merasa bangga & diapresiasi. |
| Admin Rudeboys (PIC)              | Pemilik akses penuh, mengelola harga, rekening/QRIS statis, & verifikasi pembayaran. | Panel pengaturan sederhana & antrian verifikasi bukti transfer yang jelas, tidak perlu bantuan developer untuk update harga/rekening.        |
| Admin PEADERAL (PIC kedua)        | Mitra pergerakan donasi, akses setara Admin Rudeboys.                                | Transparansi data untuk pelaporan dampak donasi ke publik, bisa ikut memverifikasi pembayaran.                                               |
| Publik / Calon Donatur Masa Depan | Orang yang mengecek transparansi sebelum ikut event berikutnya.                      | Bukti sosial (siapa saja yang sudah ikut) tanpa lihat data pribadi sensitif.                                                                 |

### 2.2 Alur Pengguna (User Flow) — Ringkas

1.  Pengunjung membuka landing page → melihat info event (rute, jarak,
    EG, jam), countdown timer menuju tutup PO (20 Sept) & tutup
    pendaftaran (25 Sept), cerita dampak PEADERAL, link ke halaman
    Peraturan & FAQ, dan CTA.

2.  Pengunjung memilih salah satu: "Daftar Saja" atau "Daftar + PO
    Jersey".

3.  Mengisi Form Data Peserta (wajib: nama lengkap, alamat lengkap, no.
    telepon; opsional: no. telepon kerabat terdekat, asal komunitas) +
    centang persetujuan data & waiver risiko (dengan link ke halaman
    Peraturan lengkap).

4.  Jika memilih PO Jersey → lanjut ke Form Spesifikasi Jersey (jenis
    lengan, ukuran, jumlah) → pilih metode ambil jersey: Ambil Langsung
    atau Dikirim (isi alamat pengiriman terpisah, ongkir ditanggung
    pembeli) → diarahkan ke halaman pembayaran berisi QRIS statis
    panitia + nomor rekening dan nominal total yang harus ditransfer
    (dihitung otomatis oleh sistem, tapi dibayarkan lewat QRIS/rekening
    tetap — bukan QRIS dinamis berbayar).

5.  Setelah transfer, pembeli mengunggah bukti transfer
    (foto/screenshot) melalui form. Status pesanan otomatis menjadi
    "Menunggu Verifikasi". Admin (Rudeboys/PEADERAL) mengecek bukti
    transfer dari dashboard dan menekan tombol "Sudah Bayar" secara
    manual — target maksimal 1x24 jam. Karena QRIS/rekening bersifat
    statis milik panitia sendiri, tidak ada potongan fee payment gateway
    sama sekali.

6.  Setelah submit/bayar, peserta menerima halaman terima kasih + desain
    Nomor BIB digital yang bisa diunduh (dimulai dari 1000) + tombol
    share ke medsos.

7.  Data yang sudah berstatus "Lunas" (klik "Sudah Bayar" oleh admin)
    otomatis tampil di tab "Partisipan Jersey" pada halaman publik "Wall
    of Heroes" lengkap dengan Total Peserta & Total Partisipan Jersey;
    jika admin salah klik, tombol "Batalkan Verifikasi" mengembalikan
    status dan otomatis menyembunyikan nama tsb dari halaman publik.

8.  Peserta yang sebelumnya hanya "Daftar Saja" bisa kembali ke website
    kapan saja sebelum 20 September untuk menyusul ikut PO Jersey lewat
    CTA "Sudah daftar tapi belum ikut PO Jersey?" (lihat Epic F), tanpa
    isi ulang data pribadi.

9.  Form pendaftaran & PO otomatis nonaktif sesuai tenggat masing-masing
    (PO: 20 Sept 2026, Pendaftaran: 25 Sept 2026).

### 2.3 User Stories & Acceptance Criteria

### Epic A — Pendaftaran Peserta

Story A1: Sebagai calon peserta, saya ingin mendaftar dengan mengisi
data singkat, supaya saya tercatat resmi ikut gowes tanpa perlu chat
panitia satu per satu.

- AC: Form memuat field Nama Lengkap*, Alamat Lengkap*, No. Telepon*,
  No. Telepon Kerabat Terdekat (opsional), Asal Komunitas (opsional).

- AC: Jika "Asal Komunitas" dikosongkan, sistem otomatis menyimpan nilai
  "Umum".

- AC: Form pendaftaran otomatis tertutup (disabled, muncul pesan info)
  setelah 25 September 2026.

- AC: Checkbox wajib centang — persetujuan data pribadi & pernyataan
  risiko (lihat kotak waiver di bawah).

- AC: Setelah submit, muncul halaman terima kasih + nomor registrasi +
  desain Nomor BIB yang bisa diunduh (lihat Epic E).

*Draft teks pernyataan risiko (waiver) yang wajib dicentang — perlu
direview ulang sebelum publish: "Saya memahami dan menyetujui bahwa Tour
de Gunung Batu adalah kegiatan bersepeda mandiri (self-supported). Saya
wajib membawa sepeda dan perlengkapan perbaikan sendiri. Panitia hanya
menyediakan rute dan penunjuk arah di persimpangan/tikungan, tidak wajib
finish, dan setiap peserta berhak memutuskan untuk melanjutkan atau
kembali sesuai kondisi masing-masing ('yakin lanjut, ragu putar balik').
Segala risiko keselamatan selama kegiatan menjadi tanggung jawab pribadi
peserta."*

### Epic B — Pre-Order Jersey (Pembayaran Gratis Fee — QRIS Statis & Verifikasi Manual)

Story B1: Sebagai calon pembeli jersey, saya ingin tahu ukuran, jenis
lengan, dan harga dengan jelas, supaya saya yakin sebelum membayar.

- AC: Menampilkan chart ukuran (S–XXL) dengan panduan ukur badan,
  mengikuti desain resmi jersey (tema biru royal, biru langit, pola
  garis topografi gunung, aksen kuning).

- AC: Pilihan Jenis Lengan: Short Sleeve / Long Sleeve, masing-masing
  dengan harga berbeda yang diambil otomatis dari Pengaturan Admin
  (lihat Epic D2).

- AC: Menampilkan keterangan "100% hasil penjualan (tanpa potongan fee
  payment gateway) didonasikan oleh pergerakan PEADERAL dalam bentuk
  sepeda" tanpa kalkulator otomatis — progres/dampak akhir diumumkan
  manual oleh Rudeboys/PEADERAL via Instagram.

- AC: Form PO Jersey otomatis tertutup (disabled) setelah 20 September
  2026, dengan pesan "PO Jersey telah ditutup untuk keperluan produksi."

- AC: Tidak ada batas kuota jumlah PO — semua pesanan yang masuk sebelum
  deadline diterima.

Story B2: Sebagai pembeli jersey, saya ingin membayar langsung ke
rekening/QRIS resmi panitia tanpa potongan fee apa pun, dan
mengonfirmasi pembayaran dengan mengunggah bukti transfer, supaya saya
yakin dana saya utuh sampai ke donasi.

- AC: Halaman pembayaran menampilkan QRIS statis panitia (gambar tetap,
  diatur admin di Pengaturan Pembayaran) dan/atau nomor rekening bank,
  beserta nominal total yang harus ditransfer (dihitung otomatis oleh
  sistem dari harga × jumlah).

- AC: Karena QRIS/rekening bersifat statis (bukan QRIS dinamis dari
  payment gateway berbayar), tidak ada fee/potongan apa pun — 100%
  nominal yang ditransfer pembeli masuk utuh ke panitia.

- AC: Setelah transfer, pembeli WAJIB mengunggah bukti transfer
  (foto/screenshot, format JPG/PNG/PDF) melalui form; status pesanan
  otomatis tercatat sebagai "Menunggu Verifikasi".

- AC: Admin memverifikasi bukti transfer secara manual dari dashboard
  (cocokkan nominal & waktu transfer), lalu menekan tombol "Sudah Bayar"
  untuk mengubah status menjadi "Lunas" — target waktu verifikasi
  maksimal 1x24 jam sejak bukti diunggah.

- AC: Jika bukti transfer tidak valid/tidak sesuai, admin dapat menandai
  status "Perlu Klarifikasi" dan sistem menampilkan catatan singkat ke
  peserta lewat nomor registrasi, agar peserta bisa mengunggah ulang
  bukti yang benar.

- AC: Status pesanan (Menunggu Verifikasi / Lunas / Perlu Klarifikasi /
  Kedaluwarsa) dapat dicek peserta lewat nomor registrasi.

- AC: Pernyataan eksplisit "Tidak ada refund untuk PO Jersey yang sudah
  dibayar" wajib ditampilkan & dicentang sebelum peserta mengunggah
  bukti transfer.

- AC: Halaman pembayaran menampilkan keterangan "Tanpa potongan fee —
  100% dana yang Anda transfer utuh untuk donasi sepeda" sebagai
  penegasan storytelling amal.

Story B3: Sebagai pembeli jersey, saya ingin memilih cara mengambil
jersey saya.

- AC: Pilihan metode: (a) Ambil Langsung (bertemu sebelum/pada hari-H),
  atau (b) Dikirim via JNE/JNT dengan ongkos kirim ditanggung pembeli.

- AC: Jika memilih "Dikirim", muncul field Alamat Pengiriman terpisah
  dari Alamat Lengkap peserta (karena bisa berbeda).

- AC: Jika memilih "Ambil Langsung", field alamat pengiriman
  disembunyikan/tidak wajib.

### Epic C — Transparansi Publik ("Wall of Heroes", 2 Tab)

Story C1: Sebagai pengunjung publik, saya ingin melihat siapa saja yang
sudah ikut berpartisipasi, supaya event ini terasa transparan dan
kredibel.

- AC: Bagian atas halaman menampilkan dua angka ringkas yang dihitung
  otomatis dari data real-time: "Total Peserta Terdaftar" dan "Total
  Partisipan Jersey (Lunas)" — ini murni penghitung jumlah orang, BUKAN
  kalkulator dana/jumlah sepeda (tetap sesuai Non-Goals 2.4), jadi tidak
  melanggar batasan "tanpa kalkulator otomatis".

- AC: Halaman publik terdiri dari 2 tab: (1) "Peserta Terdaftar" —
  menampilkan seluruh peserta yang sudah submit form pendaftaran (baik
  "Daftar Saja" maupun "PO Jersey"), kolom: Nama, Komunitas (default
  "Umum" jika kosong).

- AC: Di tab "Peserta Terdaftar" ditampilkan mini leaderboard "Komunitas
  dengan Peserta Terbanyak" (top 5, dihitung dari kolom komunitas)
  sebagai elemen kebanggaan komunitas — statistik ringan, bukan
  kompetisi resmi berhadiah.

- AC: (2) "Partisipan Jersey" — hanya menampilkan pesanan dengan status
  "Lunas" (setelah admin klik "Sudah Bayar"), kolom: Nama, Komunitas,
  dan Spesifikasi Jersey (contoh: "Jersey Long Sleeve Size L").

- AC: Pesanan yang statusnya masih "Menunggu Verifikasi" atau "Perlu
  Klarifikasi" tidak muncul di tab "Partisipan Jersey" sampai admin klik
  "Sudah Bayar". Jika admin membatalkan verifikasi (lihat Epic D), nama
  tsb otomatis hilang lagi dari tab ini dan dari Total Partisipan
  Jersey.

- AC: Alamat lengkap, alamat pengiriman, nomor telepon, dan bukti
  transfer TIDAK PERNAH ditampilkan di halaman publik dalam bentuk apa
  pun, di kedua tab.

- AC: Tersedia kolom pencarian/filter berdasarkan nama atau komunitas di
  masing-masing tab.

Story C2: Sebagai pengunjung publik, saya ingin melihat pembeda visual
sekilas antara peserta yang ikut PO Jersey dan yang hanya ikut event,
supaya kontribusi donasi mereka terlihat jelas di Wall of Heroes.

- AC: Di tab "Peserta Terdaftar", nama peserta yang statusnya "Lunas"
  pada PO Jersey ditampilkan dengan warna emas/kuning keemasan
  (mengikuti aksen kuning pada desain jersey resmi); peserta yang hanya
  "Daftar Saja" (belum/tidak ikut PO Jersey) ditampilkan dengan warna
  biru royal (mengikuti warna utama desain jersey).

- AC: Pembedaan warna disertai badge/ikon kecil (mis. ikon jersey) di
  samping nama, bukan warna semata, agar tetap terbaca jelas oleh
  pengunjung dengan buta warna (aksesibilitas).

- AC: Warna dan badge dihitung otomatis dari kombinasi kolom
  jenis_registrasi dan status_pembayaran = 'lunas' pada data peserta —
  tidak memerlukan input manual dari admin.

- AC: Di tab "Partisipan Jersey", karena seluruh baris sudah pasti
  berstatus Lunas, seluruh nama konsisten ditampilkan dengan warna
  emas/kuning yang sama seperti di tab "Peserta Terdaftar".

- AC: Jika admin menekan "Batalkan Verifikasi" (lihat Epic D), warna
  nama peserta tsb otomatis kembali menjadi biru di tab "Peserta
  Terdaftar" mengikuti perubahan status secara real-time.

- AC: Kode warna final (hex) mengikuti style guide desain jersey resmi
  (biru royal/biru langit untuk peserta event, kuning keemasan untuk
  aksen partisipan jersey) — disiapkan bersama tim desain sebelum
  development UI Wall of Heroes.

### Epic D — Admin & Pengaturan

Story D1: Sebagai admin, saya ingin dashboard sederhana untuk
memverifikasi bukti transfer peserta secara manual.

- AC: Login admin terproteksi, hanya 2 akun terdaftar (Rudeboys &
  PEADERAL) — tidak ada pendaftaran akun admin baru dari luar. Saat
  setup awal, developer hanya perlu menyiapkan 2 email login; nama &
  kontak PIC masing-masing pihak diisi belakangan oleh admin itu sendiri
  (lihat AC profil di Story D2), bukan gap yang harus dikonfirmasi
  sebelum development.

- AC: Admin dapat melihat seluruh data peserta termasuk alamat, no.
  telepon, dan alamat pengiriman (untuk logistik & emergency).

- AC: Admin melihat antrian pesanan berstatus "Menunggu Verifikasi"
  lengkap dengan bukti transfer yang diunggah peserta, lalu menekan
  tombol "Sudah Bayar" (mengubah status jadi Lunas, otomatis muncul di
  tab Partisipan Jersey Wall of Heroes) atau "Perlu Klarifikasi" — ini
  adalah jalur verifikasi utama (bukan cadangan), karena pembayaran
  tidak melalui payment gateway otomatis.

- AC: Untuk pesanan yang statusnya sudah "Lunas", admin dapat menekan
  tombol "Batalkan Verifikasi" jika terjadi kesalahan klik/checklist —
  status kembali menjadi "Menunggu Verifikasi" dan nama peserta otomatis
  hilang lagi dari halaman publik "Wall of Heroes" sampai diverifikasi
  ulang dengan benar.

- AC: Kedua admin (Rudeboys & PEADERAL) bisa melakukan verifikasi kapan
  saja tanpa jadwal piket kaku, karena dashboard menampilkan status
  real-time; koordinasi siapa-memverifikasi-yang-mana dilakukan lewat
  grup WhatsApp bersama "Rudeboys x PEADERAL" setiap ada PO baru masuk,
  supaya tidak ada pesanan yang terverifikasi dobel atau terlewat.

- AC: Admin dapat mengekspor seluruh data ke Excel/CSV (untuk rekap ke
  vendor jersey, JNE/JNT, & laporan donasi).

Story D2: Sebagai admin, saya ingin mengatur sendiri profil PIC, harga
jersey, dan QRIS/rekening pembayaran tanpa perlu bantuan developer.

- AC: Halaman "Profil Admin" (per akun) berisi field Nama PIC & Kontak
  (WhatsApp/email) yang bisa diisi/diperbarui sendiri oleh masing-masing
  admin — baik Rudeboys maupun PEADERAL — kapan saja, tanpa perlu
  dikonfirmasi ke developer terlebih dahulu.

- AC: Halaman "Pengaturan Pembayaran" berisi field: Harga Jersey Short
  Sleeve, Harga Jersey Long Sleeve, Gambar QRIS Statis (upload), Nomor
  Rekening Bank & Nama Pemilik Rekening — semua milik panitia langsung,
  tanpa API key payment gateway pihak ketiga.

- AC: Untuk peluncuran awal (MVP), QRIS statis & rekening yang diisi
  adalah milik PEADERAL, karena saat ini hanya PEADERAL yang memiliki
  akun QRIS aktif. Field ini tetap dapat diperbarui oleh admin mana pun
  kapan dibutuhkan (mis. jika ke depan Rudeboys juga punya akun QRIS
  sendiri).

- AC: Perubahan harga atau QRIS/rekening yang disimpan admin langsung
  tampil di halaman publik PO Jersey tanpa perlu deploy ulang kode.

- AC: Dashboard admin menampilkan daftar seluruh pesanan beserta status
  (Menunggu Verifikasi/Lunas/Perlu Klarifikasi/Kedaluwarsa) dan tautan
  bukti transfer masing-masing, sebagai satu-satunya sumber kebenaran
  status pembayaran.

- AC: Hanya 2 akun admin (Rudeboys & PEADERAL) yang bisa mengubah
  halaman ini, mengunggah QRIS, dan melihat bukti transfer; keduanya
  punya hak akses setara (tidak ada hierarki super-admin vs admin
  biasa).

### Epic E — Nomor BIB Digital

Story E1: Sebagai peserta yang baru mendaftar, saya ingin mendapat nomor
urut/BIB sebagai kenang-kenangan atau identitas opsional saat gowes.

- AC: Setelah submit pendaftaran (baik "Daftar Saja" maupun "PO
  Jersey"), halaman terima kasih menampilkan desain Nomor BIB (mengikuti
  tema visual jersey) berisi nomor urut peserta.

- AC: Nomor BIB dimulai dari 1000 dan naik berurutan (1000, 1001, 1002,
  …) mengikuti urutan submit pendaftaran — angka 1000 dipilih sebagai
  nod ke estimasi elevation gain (EG) rute ±1000m+, sehingga tiap BIB
  terasa seperti bagian dari "elevasi kolektif" yang didaki bersama,
  bukan sekadar nomor urut generik #001.

- AC: Desain BIB dapat diunduh sebagai gambar/PDF agar peserta bisa
  mencetak, menggunting, dan melaminating sendiri.

- AC: Tidak ada sistem check-in/scan QR di lokasi — pemakaian BIB di
  hari-H bersifat opsional sepenuhnya, tidak ada aturan wajib pasang di
  posisi tertentu.

### Epic F — Susulan PO Jersey untuk Peserta Terdaftar

Story F1: Sebagai peserta yang sudah "Daftar Saja", saya ingin bisa
menyusul ikut PO Jersey belakangan tanpa mengisi ulang data pribadi dari
nol, supaya lebih praktis kalau saya baru kepikiran mau ikut donasi
lewat jersey.

- AC: CTA "Sudah daftar tapi belum ikut PO Jersey? Klik di sini"
  ditampilkan di landing page, halaman Wall of Heroes, dan halaman
  terima kasih pendaftaran.

- AC: Peserta memasukkan Nomor Registrasi atau No. Telepon yang dipakai
  saat daftar, untuk menemukan data pendaftarannya.

- AC: Jika data ditemukan dan statusnya belum punya PO Jersey, sistem
  langsung menampilkan Form Spesifikasi Jersey (jenis lengan, ukuran,
  jumlah, metode ambil/kirim) tanpa perlu isi ulang Nama/Alamat/No.
  Telepon yang sudah ada.

- AC: Setelah submit form spesifikasi, jenis_registrasi pada data
  peserta tsb otomatis diperbarui menjadi "po_jersey" (record jersey_po
  baru ditautkan ke registrant_id yang sama), lalu peserta diarahkan ke
  halaman pembayaran QRIS statis seperti alur PO normal (checkbox
  no-refund tetap wajib).

- AC: Jika Nomor Registrasi/No. Telepon tidak ditemukan, sistem
  menampilkan pesan untuk mendaftar dulu lewat alur normal.

- AC: Fitur susulan ini otomatis nonaktif setelah 20 September 2026
  (tanggal tutup PO), mengikuti aturan tutup PO yang sama seperti alur
  normal.

### Epic G — Halaman Peraturan Event

Story G1: Sebagai calon peserta, saya ingin membaca peraturan event
secara lengkap di satu halaman, supaya saya paham konsekuensi & tata
cara sebelum mendaftar.

- AC: Halaman publik /peraturan berisi: penjelasan konsep
  self-supported, jam kumpul & titik kumpul, rute & EG, kewajiban
  membawa sepeda & alat reparasi sendiri, isi lengkap waiver risiko
  (Epic A), kebijakan tidak ada refund PO Jersey, tata cara
  pengambilan/pengiriman jersey, dan kontak darurat panitia.

- AC: Link "Peraturan" tersedia di navbar/footer semua halaman, dan
  ditautkan langsung dari checkbox waiver saat pendaftaran serta dari
  checkbox no-refund saat PO Jersey.

- AC: Desain halaman mengikuti tema visual yang sama (biru royal/biru
  langit, aksen kuning, motif topografi gunung) supaya konsisten dengan
  halaman lain.

### Epic H — Halaman FAQ

Story H1: Sebagai calon peserta/pembeli jersey, saya ingin jawaban cepat
untuk pertanyaan umum tanpa harus chat panitia.

- AC: Halaman publik /faq berisi minimal 8–10 pertanyaan umum dalam
  format accordion (klik untuk buka/tutup), mencakup topik: apa itu
  self-supported, kebijakan tidak ada refund, cara ambil vs kirim jersey
  & ongkir, cara cek status pembayaran lewat nomor registrasi, cara
  menyusul PO Jersey setelah daftar (Epic F), dan cara verifikasi
  pembayaran bekerja (tanpa fee, manual oleh admin).

- AC: Link ke halaman FAQ tersedia di navbar/footer, serta di halaman
  pembayaran dekat pernyataan no-refund.

### Epic I — Countdown Timer & Tombol Share Sosial

Story I1: Sebagai pengunjung, saya ingin melihat sisa waktu sebelum
PO/pendaftaran tutup, supaya saya terdorong untuk segera mendaftar/ikut
PO.

- AC: Landing page menampilkan dua countdown timer: menuju tanggal tutup
  PO Jersey (20 September 2026) dan menuju tanggal tutup pendaftaran (25
  September 2026), format hari:jam:menit, mengambil tanggal dari tabel
  settings (bukan hardcode).

- AC: Setelah tanggal lewat, countdown yang relevan berubah menjadi
  label statis (mis. "PO Jersey telah ditutup") mengikuti pesan yang
  sama seperti form yang nonaktif.

Story I2: Sebagai peserta yang baru dapat Nomor BIB, saya ingin
membagikan momen ini ke media sosial, supaya makin banyak yang ikut
donasi lewat jersey.

- AC: Halaman terima kasih & desain Nomor BIB menampilkan tombol
  "Bagikan" (share ke Instagram Story/WhatsApp) berisi kartu ucapan
  singkat + Nomor BIB + ajakan ikut PO Jersey (tanpa menampilkan data
  pribadi apa pun selain nama depan & nomor BIB, sesuai izin peserta).

- AC: Tombol share bersifat opsional, tidak wajib diklik untuk
  menyelesaikan pendaftaran.

### 2.4 Non-Goals (Di Luar Cakupan Versi Ini)

- Tidak membangun kalkulator otomatis "jumlah sepeda tersalurkan" dari
  dana PO (nominal rupiah → unit sepeda) — pelaporan dampak dalam bentuk
  sepeda tetap dilakukan manual oleh Rudeboys/PEADERAL via Instagram.
  (Catatan: "Total Peserta" & "Total Partisipan Jersey" di Wall of
  Heroes pada Epic C hanyalah penghitung jumlah orang, bukan kalkulator
  dana/sepeda, sehingga tidak melanggar batasan ini.)

- Tidak menggunakan payment gateway pihak ketiga berbayar (Mayar.id,
  Midtrans, Xendit, dsb.) untuk PO Jersey — pembayaran murni QRIS
  statis/rekening panitia + verifikasi manual, demi 0% potongan fee.

- Tidak menyediakan metode pembayaran selain QRIS statis & transfer bank
  manual (tanpa Virtual Account maupun kartu kredit).

- Tidak membangun sistem check-in/QR code di lokasi event.

- Tidak membangun sistem akun/login untuk peserta umum — pengecekan
  status cukup lewat nomor registrasi (termasuk untuk fitur susulan PO
  Jersey di Epic F).

- Tidak membangun fitur live tracking rute/GPS saat event berlangsung —
  rute dibagikan sebagai file GPX terpisah sebelum hari-H.

- Tidak menangani proses pengiriman fisik JNE/JNT itu sendiri (hanya
  mencatat pilihan & alamat) — proses kirim dilakukan manual oleh
  panitia.

- Tidak membatasi kuota peserta maupun kuota jersey.

- Leaderboard komunitas (Epic C) bersifat statistik ringan untuk
  kebanggaan komunitas — tidak ada hadiah, ranking resmi, atau kompetisi
  berjenjang.

## 3. Spesifikasi Teknis

### 3.1 Rekomendasi Arsitektur & Hosting

Domain yang akan dipakai: tourdegunungbatu.vercel.app (subdomain gratis
Vercel). Karena pembayaran kini memakai QRIS statis + verifikasi manual
(bukan integrasi payment gateway/webhook), kompleksitas backend
berkurang dibanding versi sebelumnya, namun logika kondisional form
(alamat pengiriman, harga per jenis lengan, form auto-tutup) tetap ada.
Berikut dua opsi:

| **Aspek**                                               | **Opsi A — Cepat (Rekomendasi Utama)**                                                                                             | **Opsi B — Custom Full-Stack**                                                                      |
|---------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| Front-end                                               | Next.js di Vercel (Hobby/Free tier), domain tourdegunungbatu.vercel.app                                                            | Next.js di Vercel (Hobby/Free tier), domain sama                                                    |
| Database                                                | Google Sheets (via API) atau Airtable Free                                                                                         | Supabase Free Tier (Postgres + Auth + Storage)                                                      |
| Halaman Pengaturan Admin (harga, rekening, QRIS statis) | Baris khusus di Google Sheet/Airtable yang dibaca front-end, diedit admin langsung di sana                                         | Halaman /admin/pengaturan dengan form tersimpan ke tabel settings, auth 2 akun via Supabase Auth    |
| Upload bukti transfer & gambar QRIS statis              | Google Drive folder (via Form) / Airtable attachment                                                                               | Supabase Storage (bucket privat untuk bukti transfer, bucket publik untuk gambar QRIS)              |
| Verifikasi pembayaran                                   | Admin cek attachment bukti transfer di spreadsheet, ubah kolom status manual                                                       | Admin cek & klik "Verifikasi Lunas" di dashboard /admin — tidak butuh integrasi webhook apa pun     |
| Biaya                                                   | Rp0                                                                                                                                | Rp0 (selama dalam batas free tier)                                                                  |
| Waktu bangun                                            | Tercepat (2–5 hari)                                                                                                                | Sedang (5–10 hari, lebih cepat dari versi Mayar.id karena tidak perlu integrasi webhook)            |
| Risiko                                                  | Pengaturan admin agak manual (edit sel spreadsheet), kurang fleksibel untuk validasi form kompleks (alamat pengiriman kondisional) | Butuh developer familiar Next.js + Supabase, tapi pengalaman admin & validasi form jauh lebih mulus |

Rekomendasi: karena ada logika kondisional (alamat pengiriman muncul
hanya jika pilih "Dikirim", harga beda per jenis lengan, form auto-tutup
di tanggal tertentu, akses admin terbatas 2 akun), Opsi B (Next.js +
Supabase) tetap lebih tepat. Dengan dihilangkannya integrasi payment
gateway berbayar, scope development justru menjadi lebih ringan —
antarmuka verifikasi manual admin cukup berupa daftar pesanan + tombol
"Verifikasi Lunas", tanpa perlu menangani webhook, signature key, atau
API pihak ketiga.

### 3.2 Arahan Tema Visual (dari referensi desain jersey)

- Warna utama: Biru Royal (≈ #1D3AAE) untuk teks/CTA utama, Biru Langit
  (≈ #A8CBEE) untuk aksen latar, Kuning (≈ #F4C716) untuk
  highlight/outline teks penting.

- Motif latar: garis-garis tipis membentuk kontur pegunungan
  (topographic line art), dipakai sebagai elemen dekoratif halus di
  background, bukan elemen utama supaya teks tetap terbaca.

- Tipografi judul: gaya bubble/rounded retro seperti pada logo "PEADERAL
  x RUDEBOYS" dan "TOUR DE GUNUNG BATU" untuk headline; gunakan font web
  yang senada (rounded, tebal) agar konsisten dengan identitas jersey.

- Ikon sepeda & lambang komunitas (PEADERAL, Rudeboys) ditempatkan di
  header/footer sebagai elemen kepercayaan (trust badge).

- Halaman pembayaran menonjolkan badge/label singkat seperti "Tanpa
  Potongan Fee — 100% untuk Donasi" agar nilai amalnya terasa di titik
  pembayaran.

### 3.3 Model Data (Ringkas)

| **Entitas** | **Field Kunci**                                                                                                                                                                                                                                                                                                                                                                          |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| registrants | id, nomor_registrasi, nomor_bib (auto-increment mulai dari 1000), nama_lengkap, alamat_lengkap, no_telepon, no_telepon_kerabat (opsional), komunitas (opsional → default "Umum"), jenis_registrasi (daftar_saja/po_jersey — dapat berubah dari daftar_saja menjadi po_jersey saat peserta menyusul ikut PO, lihat Epic F), consent_data, consent_waiver, consent_no_refund, created_at   |
| jersey_po   | id, registrant_id (FK), jenis_lengan, ukuran, qty, harga_satuan (ambil dari settings), harga_total, bukti_transfer_url (upload peserta), status_pembayaran (menunggu_verifikasi/lunas/perlu_klarifikasi/kedaluwarsa) — diupdate manual oleh admin, verified_by (admin_id), verified_at, metode_ambil (ambil_langsung/dikirim), alamat_pengiriman (nullable, wajib jika dikirim), paid_at |
| settings    | harga_short_sleeve, harga_long_sleeve, qris_image_url (gambar QRIS statis panitia), nomor_rekening, nama_pemilik_rekening, tanggal_tutup_po (default 2026-09-20), tanggal_tutup_pendaftaran (default 2026-09-25)                                                                                                                                                                         |
| admin_users | id, nama_pic, kontak_pic (WA/email, self-editable), email_login, pihak (rudeboys/peaderal) — dibatasi tepat 2 baris, tidak ada fitur self sign-up                                                                                                                                                                                                                                        |

View publik ("Wall of Heroes") hanya boleh mengambil kolom:
nama_lengkap, komunitas (fallback "Umum"), dan gabungan jenis_lengan +
ukuran — dari baris dengan status_pembayaran = 'lunas' atau
jenis_registrasi = 'daftar_saja'. Kolom alamat_lengkap,
alamat_pengiriman, no_telepon, no_telepon_kerabat, dan
bukti_transfer_url tidak pernah ikut ter-query di endpoint publik.

### 3.4 Keamanan & Privasi Data

- Alamat lengkap, alamat pengiriman, nomor telepon (termasuk kerabat),
  dan bukti transfer hanya bisa diakses lewat panel admin dengan
  otentikasi — tidak pernah lewat endpoint publik.

- Row Level Security (RLS) di Supabase: role "public" hanya bisa query
  dari view terbatas, bukan tabel penuh; tabel settings & admin_users
  sepenuhnya tertutup dari akses publik.

- Consent eksplisit (checkbox terpisah) untuk: (1) penggunaan data
  pribadi, (2) pernyataan risiko/waiver event mandiri, (3) kebijakan
  tidak ada refund.

- Bukti transfer disimpan di storage privat (hanya admin yang bisa
  akses); gambar QRIS statis bersifat publik (memang untuk ditampilkan
  ke calon pembeli).

- Login admin dibatasi tepat 2 akun terdaftar manual (bukan sistem
  sign-up terbuka) untuk mencegah akses tidak sah ke Pengaturan
  Pembayaran dan proses verifikasi bukti transfer.

- Karena tidak ada payment gateway pihak ketiga, tidak ada
  webhook/signature yang perlu diverifikasi — namun status "Lunas" hanya
  bisa diubah oleh 2 akun admin yang terautentikasi, untuk mencegah
  manipulasi status oleh pihak luar.

### 3.5 Integrasi

- Instagram @peaderalindonesia — ditautkan sebagai bukti sosial dampak
  (link, bukan API resmi kecuali sudah ada akses Graph API).

- WhatsApp — opsional, tombol "Konfirmasi via WhatsApp" ke nomor
  panitia, dapat dipakai peserta untuk mempercepat konfirmasi verifikasi
  manual jika diperlukan.

- File GPX rute — direncanakan rilis H-1 (26 September 2026) sebagai
  link download di landing page; sebelum tanggal tersebut, landing page
  menampilkan info jarak (±30 KM + ±30 KM) dan EG (±1000m+) yang sudah
  tersedia.

Tidak ada integrasi payment gateway pihak ketiga
(Mayar.id/Midtrans/Xendit dsb.) pada versi ini — pembayaran sepenuhnya
QRIS statis/rekening panitia.

## 4. Risiko & Roadmap

### 4.1 Rollout Bertahap

| **Fase**                              | **Cakupan**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| MVP (target live H-10, 17 Sept 2026)  | Landing page (tema visual dari desain jersey, countdown timer) + halaman Peraturan + halaman FAQ + form pendaftaran + form PO jersey (harga per jenis lengan, metode ambil/kirim) + alur susulan PO Jersey untuk peserta "Daftar Saja" + halaman pembayaran QRIS statis & upload bukti transfer + dashboard verifikasi manual admin (Sudah Bayar/Batalkan Verifikasi) + halaman Pengaturan & Profil Admin (harga, QRIS, rekening, PIC) + Wall of Heroes 2 tab dengan Total Peserta/Partisipan Jersey & leaderboard komunitas + Nomor BIB digital (mulai 1000) + tombol share sosial |
| v1.1 (pasca-event / event berikutnya) | Notifikasi WA/email otomatis ke peserta begitu status Lunas diverifikasi, dashboard admin dengan grafik ringkas total dana masuk                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| v2.0 (platform jangka panjang)        | Platform multi-event untuk Rudeboys/PEADERAL, riwayat kontribusi per peserta, integrasi API Instagram resmi untuk auto-post laporan dampak; opsi payment gateway otomatis dapat dipertimbangkan ulang jika volume PO membesar dan fee sudah dianggap sepadan dengan efisiensi waktu admin                                                                                                                                                                                                                                                                                           |

### 4.2 Risiko Teknis & Mitigasi

| **Risiko**                                                                               | **Mitigasi**                                                                                                                                                                                                                                                                                                 |
|------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Waktu pengembangan ketat, dua tenggat berbeda (PO 20 Sept, pendaftaran 25 Sept)          | Tenggat disimpan sebagai data di tabel settings, form otomatis nonaktif tanpa perlu intervensi manual tepat waktu                                                                                                                                                                                            |
| Verifikasi manual bisa menumpuk/lambat jika PO membludak mendekati deadline 20 September | Kedua admin (Rudeboys & PEADERAL) memantau dashboard dan saling menginformasikan PO baru masuk lewat grup WhatsApp bersama "Rudeboys x PEADERAL", sehingga verifikasi bisa dilakukan siapa saja yang sempat tanpa jadwal piket kaku; mendekati deadline, frekuensi cek dipercepat sesuai kesepakatan di grup |
| Bukti transfer palsu atau nominal tidak sesuai                                           | Admin mencocokkan nominal & waktu transfer pada bukti dengan mutasi rekening/riwayat QRIS sebelum menekan "Verifikasi Lunas"; status "Perlu Klarifikasi" dipakai jika ada keraguan                                                                                                                           |
| Kebocoran data pribadi (alamat, alamat pengiriman, telepon, bukti transfer)              | Pisahkan view publik vs tabel privat; aktifkan RLS/auth; field sensitif (termasuk bukti transfer) tidak pernah di-query dari endpoint publik                                                                                                                                                                 |
| Akses tidak sah ke Pengaturan Pembayaran (harga, gambar QRIS, nomor rekening)            | Hanya 2 akun admin terdaftar manual, tanpa fitur sign-up publik; wajib autentikasi setiap sesi                                                                                                                                                                                                               |
| Event bersifat mandiri — potensi risiko keselamatan peserta                              | Waiver risiko wajib dicentang saat pendaftaran (lihat draft teks di Epic A); rute & penunjuk arah disediakan panitia di setiap persimpangan                                                                                                                                                                  |
| Kompleksitas pengiriman jersey (alamat kondisional, ongkir ditanggung pembeli)           | Field alamat pengiriman hanya muncul dan wajib diisi bila metode "Dikirim" dipilih; ongkir dikomunikasikan manual oleh admin ke pembeli setelah pembayaran lunas                                                                                                                                             |

## 5. Keputusan Terkonfirmasi & Sisa Gap Pertanyaan

### 5.1 Sudah Dikonfirmasi (tidak perlu dibahas lagi sebelum development)

- Nama & kontak PIC dari Rudeboys maupun PEADERAL TIDAK perlu ditetapkan
  di awal — masing-masing admin mengisi/memperbarui sendiri Nama &
  Kontak PIC lewat halaman "Profil Admin" miliknya sendiri (lihat Epic
  D2). Yang perlu disiapkan developer di awal hanya 2 email login.

- Rekening/QRIS statis yang dipakai untuk MVP: milik PEADERAL, karena
  saat ini hanya PEADERAL yang punya akun QRIS aktif. Field ini tetap
  bisa diperbarui admin mana pun di kemudian hari lewat Pengaturan
  Pembayaran.

- SOP verifikasi manual: dilakukan bergantian oleh Rudeboys maupun
  PEADERAL kapan saja mereka sempat — begitu ada PO baru masuk di web,
  informasinya dibagikan lewat grup WhatsApp bersama "Rudeboys x
  PEADERAL" agar tidak ada yang terlewat atau terverifikasi dobel. Tidak
  ada jadwal piket kaku.

- Tanggal rilis file GPX rute: H-1, yaitu 26 September 2026, sehari
  sebelum hari-H.

- Format Nomor BIB: nomor saja (tanpa nama peserta), dimulai dari 1000
  dan naik berurutan (1000, 1001, 1002, …) — angka 1000
  merepresentasikan EG ±1000m+ rute, agar terasa lebih bermakna dan unik
  dibanding nomor urut generik #001.

### 5.2 Masih Perlu Dikonfirmasi

1.  Redaksi final teks disclaimer/waiver risiko (draft sudah disiapkan
    di Epic A) — disarankan direview sekali lagi oleh kedua pihak
    sebelum dipublikasikan.

2.  Consent foto/dokumentasi event untuk keperluan promosi — apakah
    perlu checkbox terpisah, atau cukup disebutkan dalam consent data
    umum?
