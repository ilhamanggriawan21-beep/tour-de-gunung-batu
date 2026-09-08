-- =======================================================
-- TOUR DE GUNUNG BATU 2026 - SUPABASE DATABASE SCHEMA
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor
-- =======================================================

-- 1. SEQUENCE UNTUK NOMOR BIB (Mulai dari 1000)
CREATE SEQUENCE IF NOT EXISTS bib_number_seq START WITH 1000;

-- 2. TABEL REGISTRANTS (Data Peserta Gowes)
CREATE TABLE IF NOT EXISTS registrants (
  id TEXT PRIMARY KEY,
  nomor_registrasi TEXT UNIQUE NOT NULL,
  nomor_bib INTEGER UNIQUE NOT NULL DEFAULT nextval('bib_number_seq'),
  nama_lengkap TEXT NOT NULL,
  alamat_lengkap TEXT NOT NULL,
  no_telepon TEXT NOT NULL,
  no_telepon_kerabat TEXT,
  komunitas TEXT DEFAULT 'Umum',
  jenis_registrasi TEXT NOT NULL CHECK (jenis_registrasi IN ('daftar_saja', 'po_jersey')),
  consent_data BOOLEAN DEFAULT true,
  consent_waiver BOOLEAN DEFAULT true,
  consent_no_refund BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL JERSEY_POS (Pesanan Pre-Order Jersey & Pembayaran)
CREATE TABLE IF NOT EXISTS jersey_pos (
  id TEXT PRIMARY KEY,
  registrant_id TEXT NOT NULL REFERENCES registrants(id) ON DELETE CASCADE,
  jenis_lengan TEXT NOT NULL CHECK (jenis_lengan IN ('short_sleeve', 'long_sleeve')),
  ukuran TEXT NOT NULL CHECK (ukuran IN ('S', 'M', 'L', 'XL', 'XXL')),
  qty INTEGER NOT NULL DEFAULT 1,
  harga_satuan INTEGER NOT NULL,
  harga_total INTEGER NOT NULL,
  bukti_transfer_url TEXT,
  status_pembayaran TEXT NOT NULL DEFAULT 'menunggu_verifikasi' 
    CHECK (status_pembayaran IN ('menunggu_verifikasi', 'lunas', 'perlu_klarifikasi', 'kedaluwarsa')),
  metode_ambil TEXT NOT NULL DEFAULT 'ambil_langsung' 
    CHECK (metode_ambil IN ('ambil_langsung', 'dikirim')),
  alamat_pengiriman TEXT,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  catatan_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL SETTINGS (Pengaturan Global Pembayaran & Rekening)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  harga_short_sleeve INTEGER NOT NULL DEFAULT 120000,
  harga_long_sleeve INTEGER NOT NULL DEFAULT 135000,
  qris_image_url TEXT NOT NULL DEFAULT '/qris-peaderal.png',
  nomor_rekening TEXT NOT NULL DEFAULT '5220394811',
  nama_bank TEXT NOT NULL DEFAULT 'BCA',
  nama_pemilik_rekening TEXT NOT NULL DEFAULT 'PERGERAKAN SEPEDAH PEADERAL',
  tanggal_tutup_po TIMESTAMPTZ NOT NULL DEFAULT '2026-09-20T23:59:59+07:00',
  tanggal_tutup_pendaftaran TIMESTAMPTZ NOT NULL DEFAULT '2026-09-25T23:59:59+07:00',
  kontak_wa_panitia TEXT NOT NULL DEFAULT '6287745870767',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inisialisasi data default settings (jika belum ada)
INSERT INTO settings (
  id, harga_short_sleeve, harga_long_sleeve, qris_image_url, nomor_rekening,
  nama_bank, nama_pemilik_rekening, tanggal_tutup_po, tanggal_tutup_pendaftaran, kontak_wa_panitia
) VALUES (
  1, 120000, 135000, '/qris-peaderal.png', '5220394811',
  'BCA', 'PERGERAKAN SEPEDAH PEADERAL', '2026-09-20T23:59:59+07:00', '2026-09-25T23:59:59+07:00', '6287745870767'
) ON CONFLICT (id) DO NOTHING;

-- 5. TABEL ADMIN_USERS (Superadmin & PIC Rudeboys / PEADERAL)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email_login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT 'admin123',
  pihak TEXT NOT NULL CHECK (pihak IN ('superadmin', 'rudeboys', 'peaderal')),
  role TEXT NOT NULL DEFAULT 'pic' CHECK (role IN ('superadmin', 'pic')),
  nama_pic TEXT NOT NULL,
  kontak_pic TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inisialisasi Akun Superadmin & PIC Default
INSERT INTO admin_users (id, email_login, password, pihak, role, nama_pic, kontak_pic)
VALUES 
  ('adm-super', 'admin.tourdegunungbatu.com', 'P@ssw0rd', 'superadmin', 'superadmin', 'Admin Utama (Superadmin)', '081298765432'),
  ('adm-rudeboys', 'rudeboys@tourdegunungbatu.com', 'admin123', 'rudeboys', 'pic', 'PIC Rudeboys Cyclist', '08123456789'),
  ('adm-peaderal', 'peaderal@tourdegunungbatu.com', 'admin123', 'peaderal', 'pic', 'PIC Pergerakan PEADERAL', '08987654321')
ON CONFLICT (email_login) DO NOTHING;

-- 6. STORAGE BUCKET UNTUK BUKTI TRANSFER (payment-proofs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy Storage: Publik bisa melihat bukti transfer
CREATE POLICY "Public Read Payment Proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

-- Policy Storage: Siapapun (peserta) bisa upload bukti transfer
CREATE POLICY "Public Upload Payment Proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

-- =======================================================
-- SELESAI. Database siap digunakan!
-- =======================================================
