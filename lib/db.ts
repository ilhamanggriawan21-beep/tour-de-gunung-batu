import fs from 'fs';
import path from 'path';

export interface Registrant {
  id: string;
  nomor_registrasi: string;
  nomor_bib: number;
  nama_lengkap: string;
  alamat_lengkap: string;
  no_telepon: string;
  no_telepon_kerabat?: string;
  komunitas: string;
  jenis_registrasi: 'daftar_saja' | 'po_jersey';
  consent_data: boolean;
  consent_waiver: boolean;
  consent_no_refund?: boolean;
  is_checked_in?: boolean;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  created_at: string;
}

export interface BibLookupParticipant {
  nomor_bib: number;
  nama_lengkap: string;
  komunitas: string;
  nomor_registrasi: string;
  jenis_registrasi: 'daftar_saja' | 'po_jersey';
  batch_produksi?: number | null;
  status_jersey?: string | null;
}

export type JerseyKategori = 'dewasa' | 'anak';
export type JerseySize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL' | '5XL' | '2XS' | 'XS' | 'Kids 2XS' | 'Kids XS' | 'Kids S' | 'Kids M' | 'Kids L' | 'Kids XL' | 'Kids 2XL' | string;

export interface JerseyPO {
  id: string;
  registrant_id: string;
  kategori_ukuran?: JerseyKategori;
  jenis_lengan: 'short_sleeve' | 'long_sleeve';
  ukuran: JerseySize;
  qty: number;
  harga_satuan: number;
  harga_total: number;
  bukti_transfer_url?: string;
  status_pembayaran: 'menunggu_verifikasi' | 'lunas' | 'perlu_klarifikasi' | 'kedaluwarsa';
  metode_ambil: 'ambil_langsung' | 'dikirim';
  alamat_pengiriman?: string;
  verified_by?: string;
  verified_at?: string;
  paid_at?: string;
  catatan_admin?: string;
  is_shipped?: boolean;
  shipped_at?: string | null;
  shipped_by?: string | null;
  no_resi?: string | null;
  batch_produksi?: number | null; // 1 for Batch 1 (<= 1184 Hanifsyah Aditya), 2 for Batch 2, null for unbatched
}

export interface Settings {
  harga_short_sleeve: number;
  harga_long_sleeve: number;
  qris_image_url: string;
  nomor_rekening: string;
  nama_bank: string;
  nama_pemilik_rekening: string;
  tanggal_tutup_po: string;
  tanggal_tutup_pendaftaran: string;
  kontak_wa_panitia: string;
}

export interface AdminUser {
  id: string;
  email_login: string;
  password?: string;
  pihak: 'rudeboys' | 'peaderal' | 'superadmin';
  role?: 'superadmin' | 'pic';
  nama_pic: string;
  kontak_pic: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  deskripsi: string;
  kategori?: 'produksi' | 'logistik' | 'konsumsi' | 'operasional' | 'lainnya';
  qty: number;
  harga_satuan: number;
  harga_total: number;
  bukti_url?: string;
  tanggal: string; // YYYY-MM-DD
  created_by?: string;
  created_at: string;
}

export interface FinanceSummary {
  total_pemasukan_lunas: number;
  total_qty_jersey_lunas: number;
  total_estimasi_pending: number; // Piutang / belum bayar - TIDAK MASUK KE TOTAL PEMASUKAN
  total_qty_jersey_pending: number;
  total_pengeluaran: number;
  saldo_kas: number; // total_pemasukan_lunas - total_pengeluaran
  expenses: Expense[];
  recent_pemasukan: Array<{
    id: string;
    nama_lengkap: string;
    nomor_bib: number;
    komunitas: string;
    jersey_spec_str: string;
    harga_total: number;
    paid_at?: string;
  }>;
}

interface DBData {
  last_bib: number;
  registrants: Registrant[];
  jersey_pos: JerseyPO[];
  settings: Settings;
  admins: AdminUser[];
  expenses: Expense[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

const DEFAULT_SETTINGS: Settings = {
  harga_short_sleeve: 175000,
  harga_long_sleeve: 185000,
  qris_image_url: '/qris-peaderal.png',
  nomor_rekening: '5220394811',
  nama_bank: 'BCA',
  nama_pemilik_rekening: 'BENGKEL SEPEDA STEELSYNDICATE',
  tanggal_tutup_po: '2026-09-20T23:59:59',
  tanggal_tutup_pendaftaran: '2026-09-25T23:59:59',
  kontak_wa_panitia: '6287745870767'
};

const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'adm-super',
    email_login: 'admin.tourdegunungbatu.com',
    password: 'P@ssw0rd',
    pihak: 'superadmin',
    role: 'superadmin',
    nama_pic: 'Admin Utama (Superadmin)',
    kontak_pic: '081298765432'
  },
  {
    id: 'adm-rudeboys',
    email_login: 'rudeboys@tourdegunungbatu.com',
    password: 'admin123',
    pihak: 'rudeboys',
    role: 'pic',
    nama_pic: 'PIC Rudeboys Cyclist',
    kontak_pic: '08123456789'
  },
  {
    id: 'adm-peaderal',
    email_login: 'peaderal@tourdegunungbatu.com',
    password: 'admin123',
    pihak: 'peaderal',
    role: 'pic',
    nama_pic: 'PIC Pergerakan PEADERAL',
    kontak_pic: '08987654321'
  },
  {
    id: 'adm-weni',
    email_login: 'weni@tourdegunungbatu.com',
    password: 'rudeboystdgb',
    pihak: 'rudeboys',
    role: 'pic',
    nama_pic: 'Weni (Panitia TDGB)',
    kontak_pic: '0812000001'
  },
  {
    id: 'adm-bungs',
    email_login: 'bungs@tourdegunungbatu.com',
    password: 'rudeboystdgb',
    pihak: 'rudeboys',
    role: 'pic',
    nama_pic: 'Bungs (Panitia TDGB)',
    kontak_pic: '0812000002'
  },
  {
    id: 'adm-lina',
    email_login: 'lina@tourdegunungbatu.com',
    password: 'rudeboystdgb',
    pihak: 'rudeboys',
    role: 'pic',
    nama_pic: 'Lina (Panitia TDGB)',
    kontak_pic: '0812000003'
  },
  {
    id: 'adm-mumu',
    email_login: 'mumu@tourdegunungbatu.com',
    password: 'rudeboystdgb',
    pihak: 'rudeboys',
    role: 'pic',
    nama_pic: 'Mumu (Panitia TDGB)',
    kontak_pic: '0812000004'
  },
  {
    id: 'adm-tia',
    email_login: 'tia@tourdegunungbatu.com',
    password: 'rudeboystdgb',
    pihak: 'rudeboys',
    role: 'pic',
    nama_pic: 'Tia (Panitia TDGB)',
    kontak_pic: '0812000005'
  },
  {
    id: 'adm-desi',
    email_login: 'desi@tourdegunungbatu.com',
    password: 'rudeboystdgb',
    pihak: 'rudeboys',
    role: 'pic',
    nama_pic: 'Desi (Panitia TDGB)',
    kontak_pic: '0812000006'
  }
];

function readDB(): DBData {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      const initial: DBData = {
        last_bib: 999,
        registrants: [],
        jersey_pos: [],
        settings: DEFAULT_SETTINGS,
        admins: DEFAULT_ADMINS,
        expenses: []
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.settings) data.settings = DEFAULT_SETTINGS;
    if (!data.expenses) data.expenses = [];
    if (!data.admins) {
      data.admins = DEFAULT_ADMINS;
    } else {
      // Ensure superadmin account is always present
      const hasSuper = data.admins.some((a: AdminUser) => a.role === 'superadmin' || a.email_login === 'admin.tourdegunungbatu.com');
      if (!hasSuper) {
        data.admins.unshift(DEFAULT_ADMINS[0]);
        writeDB(data);
      }
    }
    return data;
  } catch (err) {
    console.error('Failed reading DB:', err);
    return {
      last_bib: 999,
      registrants: [],
      jersey_pos: [],
      settings: DEFAULT_SETTINGS,
      admins: DEFAULT_ADMINS,
      expenses: []
    };
  }
}

function writeDB(data: DBData): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!data.expenses) data.expenses = [];
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed writing DB:', err);
  }
}

import { isSupabaseConfigured } from './supabase';
import {
  getSupabaseSettings,
  updateSupabaseSettings,
  getSupabaseAdmins,
  createSupabaseAdminUser,
  deleteSupabaseAdminUser,
  updateSupabaseAdminProfile,
  registerSupabaseParticipant,
  addSupabaseLateJerseyPO,
  uploadSupabasePaymentProof,
  getSupabaseRegistrationDetails,
  updateSupabasePaymentStatus,
  getSupabaseWallOfHeroesData,
  getSupabaseAllAdminData,
  deleteSupabaseRegistrant,
  deleteSupabaseJerseyPO,
  updateSupabaseRegistrantAndPO,
  getSupabaseBibLookup,
  updateSupabaseCheckInStatus,
  updateSupabaseShippingStatus,
  updateSupabaseJerseyBatch,
  assignSupabaseUnbatchedToBatch,
  getSupabaseExpenses,
  addSupabaseExpense,
  updateSupabaseExpense,
  deleteSupabaseExpense
} from './supabase-db';

function getLocalSettings(): Settings {
  const db = readDB();
  return db.settings;
}

function updateLocalSettings(newSettings: Partial<Settings>): Settings {
  const db = readDB();
  db.settings = { ...db.settings, ...newSettings };
  writeDB(db);
  return db.settings;
}

function getLocalAdmins(): AdminUser[] {
  const db = readDB();
  return db.admins;
}

function createLocalAdminUser(data: {
  email_login: string;
  password?: string;
  pihak: 'rudeboys' | 'peaderal';
  nama_pic: string;
  kontak_pic: string;
}): AdminUser {
  const db = readDB();
  const newAdmin: AdminUser = {
    id: 'adm_' + Math.random().toString(36).substring(2, 9),
    email_login: data.email_login.trim(),
    password: data.password || 'admin123',
    pihak: data.pihak,
    role: 'pic',
    nama_pic: data.nama_pic.trim(),
    kontak_pic: data.kontak_pic.trim(),
    created_at: new Date().toISOString()
  };
  db.admins.push(newAdmin);
  writeDB(db);
  return newAdmin;
}

function deleteLocalAdminUser(id: string): boolean {
  const db = readDB();
  const idx = db.admins.findIndex(a => a.id === id);
  if (idx !== -1) {
    // Protect superadmin from deletion
    if (db.admins[idx].role === 'superadmin') {
      return false;
    }
    db.admins.splice(idx, 1);
    writeDB(db);
    return true;
  }
  return false;
}

function updateLocalAdminProfile(id: string, nama_pic: string, kontak_pic: string): AdminUser | null {
  const db = readDB();
  const idx = db.admins.findIndex(a => a.id === id || a.email_login === id);
  if (idx !== -1) {
    db.admins[idx].nama_pic = nama_pic;
    db.admins[idx].kontak_pic = kontak_pic;
    writeDB(db);
    return db.admins[idx];
  }
  return null;
}

function registerLocalParticipant(data: {
  nama_lengkap: string;
  alamat_lengkap: string;
  no_telepon: string;
  no_telepon_kerabat?: string;
  komunitas?: string;
  jenis_registrasi: 'daftar_saja' | 'po_jersey';
  consent_data: boolean;
  consent_waiver: boolean;
  consent_no_refund?: boolean;
  // If PO Jersey
  jersey_spec?: {
    kategori_ukuran?: JerseyKategori;
    jenis_lengan: 'short_sleeve' | 'long_sleeve';
    ukuran: JerseySize;
    qty: number;
    metode_ambil: 'ambil_langsung' | 'dikirim';
    alamat_pengiriman?: string;
  };
}): { registrant: Registrant; jersey_po?: JerseyPO } {
  const db = readDB();
  
  // Auto increment BIB starting at 1000
  db.last_bib += 1;
  const newBib = db.last_bib;

  const regId = 'reg_' + Math.random().toString(36).substring(2, 9);
  const nomorReg = 'TDGB-' + Math.floor(10000 + Math.random() * 90000);

  const registrant: Registrant = {
    id: regId,
    nomor_registrasi: nomorReg,
    nomor_bib: newBib,
    nama_lengkap: data.nama_lengkap,
    alamat_lengkap: data.alamat_lengkap,
    no_telepon: data.no_telepon,
    no_telepon_kerabat: data.no_telepon_kerabat || '',
    komunitas: (data.komunitas && data.komunitas.trim() !== '') ? data.komunitas.trim() : 'Umum',
    jenis_registrasi: data.jenis_registrasi,
    consent_data: data.consent_data,
    consent_waiver: data.consent_waiver,
    consent_no_refund: data.consent_no_refund || false,
    created_at: new Date().toISOString()
  };

  db.registrants.push(registrant);

  let jerseyPO: JerseyPO | undefined = undefined;

  if (data.jenis_registrasi === 'po_jersey' && data.jersey_spec) {
    const hargaSatuan = data.jersey_spec.jenis_lengan === 'short_sleeve'
      ? db.settings.harga_short_sleeve
      : db.settings.harga_long_sleeve;

    const poId = 'po_' + Math.random().toString(36).substring(2, 9);
    jerseyPO = {
      id: poId,
      registrant_id: regId,
      kategori_ukuran: data.jersey_spec.kategori_ukuran || 'dewasa',
      jenis_lengan: data.jersey_spec.jenis_lengan,
      ukuran: data.jersey_spec.ukuran,
      qty: data.jersey_spec.qty,
      harga_satuan: hargaSatuan,
      harga_total: hargaSatuan * data.jersey_spec.qty,
      status_pembayaran: 'menunggu_verifikasi',
      metode_ambil: data.jersey_spec.metode_ambil,
      alamat_pengiriman: data.jersey_spec.alamat_pengiriman || ''
    };
    db.jersey_pos.push(jerseyPO);
  }

  writeDB(db);
  return { registrant, jersey_po: jerseyPO };
}

function addLateLocalJerseyPO(registrantIdOrNo: string, jerseySpec: {
  kategori_ukuran?: JerseyKategori;
  jenis_lengan: 'short_sleeve' | 'long_sleeve';
  ukuran: JerseySize;
  qty: number;
  metode_ambil: 'ambil_langsung' | 'dikirim';
  alamat_pengiriman?: string;
  consent_no_refund: boolean;
}): { registrant: Registrant; jersey_po?: JerseyPO } | null {
  const db = readDB();

  const regIndex = db.registrants.findIndex(
    r => r.id === registrantIdOrNo || 
         r.nomor_registrasi.toLowerCase() === registrantIdOrNo.toLowerCase() ||
         r.no_telepon === registrantIdOrNo
  );

  if (regIndex === -1) return null;

  const registrant = db.registrants[regIndex];
  registrant.jenis_registrasi = 'po_jersey';
  registrant.consent_no_refund = jerseySpec.consent_no_refund;

  const hargaSatuan = jerseySpec.jenis_lengan === 'short_sleeve'
    ? db.settings.harga_short_sleeve
    : db.settings.harga_long_sleeve;

  // Check if jersey PO already exists for this registrant
  let existingPoIdx = db.jersey_pos.findIndex(p => p.registrant_id === registrant.id);

  let jerseyPO: JerseyPO;
  if (existingPoIdx !== -1) {
    jerseyPO = {
      ...db.jersey_pos[existingPoIdx],
      kategori_ukuran: jerseySpec.kategori_ukuran || db.jersey_pos[existingPoIdx].kategori_ukuran || 'dewasa',
      jenis_lengan: jerseySpec.jenis_lengan,
      ukuran: jerseySpec.ukuran,
      qty: jerseySpec.qty,
      harga_satuan: hargaSatuan,
      harga_total: hargaSatuan * jerseySpec.qty,
      metode_ambil: jerseySpec.metode_ambil,
      alamat_pengiriman: jerseySpec.alamat_pengiriman || '',
      status_pembayaran: 'menunggu_verifikasi'
    };
    db.jersey_pos[existingPoIdx] = jerseyPO;
  } else {
    const poId = 'po_' + Math.random().toString(36).substring(2, 9);
    jerseyPO = {
      id: poId,
      registrant_id: registrant.id,
      kategori_ukuran: jerseySpec.kategori_ukuran || 'dewasa',
      jenis_lengan: jerseySpec.jenis_lengan,
      ukuran: jerseySpec.ukuran,
      qty: jerseySpec.qty,
      harga_satuan: hargaSatuan,
      harga_total: hargaSatuan * jerseySpec.qty,
      status_pembayaran: 'menunggu_verifikasi',
      metode_ambil: jerseySpec.metode_ambil,
      alamat_pengiriman: jerseySpec.alamat_pengiriman || ''
    };
    db.jersey_pos.push(jerseyPO);
  }

  writeDB(db);
  return { registrant, jersey_po: jerseyPO };
}

function uploadLocalPaymentProof(nomorRegistrasi: string, buktiUrl: string): JerseyPO | null {
  const db = readDB();
  const reg = db.registrants.find(r => r.nomor_registrasi.toLowerCase() === nomorRegistrasi.toLowerCase());
  if (!reg) return null;

  const poIdx = db.jersey_pos.findIndex(p => p.registrant_id === reg.id);
  if (poIdx === -1) return null;

  db.jersey_pos[poIdx].bukti_transfer_url = buktiUrl;
  db.jersey_pos[poIdx].status_pembayaran = 'menunggu_verifikasi';
  writeDB(db);
  return db.jersey_pos[poIdx];
}

function getLocalRegistrationDetails(nomorRegistrasi: string): { registrant: Registrant; jersey_po?: JerseyPO; settings: Settings } | null {
  const db = readDB();
  const reg = db.registrants.find(
    r => r.nomor_registrasi.toLowerCase() === nomorRegistrasi.toLowerCase() ||
         r.no_telepon === nomorRegistrasi ||
         r.id === nomorRegistrasi
  );
  if (!reg) return null;

  const po = db.jersey_pos.find(p => p.registrant_id === reg.id);
  const resolvedPo = po ? {
    ...po,
    batch_produksi: po.batch_produksi !== undefined && po.batch_produksi !== null
      ? po.batch_produksi
      : (reg.nomor_bib <= 1184 ? 1 : null)
  } : undefined;

  return {
    registrant: reg,
    jersey_po: resolvedPo,
    settings: db.settings
  };
}

function getLocalBibLookup(nomorBib: number): BibLookupParticipant | null {
  const db = readDB();
  const registrant = db.registrants.find((item) => item.nomor_bib === nomorBib);
  if (!registrant) return null;

  let batch_produksi: number | null = null;
  let status_jersey: string | null = null;
  const po = db.jersey_pos.find((p) => p.registrant_id === registrant.id);
  if (po) {
    status_jersey = po.status_pembayaran;
    batch_produksi = po.batch_produksi !== undefined && po.batch_produksi !== null
      ? po.batch_produksi
      : (registrant.nomor_bib <= 1184 ? 1 : null);
  }

  return {
    nomor_bib: registrant.nomor_bib,
    nama_lengkap: registrant.nama_lengkap,
    komunitas: registrant.komunitas,
    nomor_registrasi: registrant.nomor_registrasi,
    jenis_registrasi: registrant.jenis_registrasi,
    batch_produksi,
    status_jersey
  };
}

function updateLocalPaymentStatus(
  poId: string, 
  status: 'lunas' | 'menunggu_verifikasi' | 'perlu_klarifikasi' | 'kedaluwarsa',
  verifiedBy: string = 'Admin',
  catatanAdmin: string = ''
): JerseyPO | null {
  const db = readDB();
  const poIdx = db.jersey_pos.findIndex(p => p.id === poId);
  if (poIdx === -1) return null;

  db.jersey_pos[poIdx].status_pembayaran = status;
  db.jersey_pos[poIdx].verified_by = verifiedBy;
  db.jersey_pos[poIdx].verified_at = new Date().toISOString();
  db.jersey_pos[poIdx].catatan_admin = catatanAdmin;

  if (status === 'lunas') {
    db.jersey_pos[poIdx].paid_at = new Date().toISOString();
  }

  writeDB(db);
  return db.jersey_pos[poIdx];
}

export function normalizeCommunityName(name?: string): string {
  if (!name) return 'Umum';
  const clean = name.trim().replace(/\s+/g, ' ');
  if (
    !clean ||
    clean.toLowerCase() === 'umum' ||
    clean.toLowerCase() === '-' ||
    clean.toLowerCase() === 'none' ||
    clean.toLowerCase() === 'pribadi' ||
    clean.toLowerCase() === 'individu' ||
    clean.toLowerCase() === 'personal' ||
    clean.toLowerCase() === 'sendiri'
  ) {
    return 'Umum';
  }

  // Common alias normalization
  const lower = clean.toLowerCase();
  if (
    lower === 'rudeboys' ||
    lower === 'rudeboy' ||
    lower === 'rude boys' ||
    lower === 'rudeboys cc' ||
    lower === 'rudeboys cyclist' ||
    lower === 'rudeboy cyclist'
  ) {
    return 'Rudeboys Cyclist';
  }
  if (
    lower === 'peaderal' ||
    lower === 'peaderal mtb' ||
    lower === 'peaderal indonesia' ||
    lower === 'pergerakan peaderal'
  ) {
    return 'PEADERAL';
  }

  // Format Title Case nicely
  return clean
    .split(' ')
    .map((word) => {
      const upper = word.toUpperCase();
      if (['CC', 'MTB', 'RB', 'CT', 'GOP', 'TCC', 'MCC', 'KCC', 'KGB', 'JCC', 'BCC', 'GCC', 'RCC', 'PEADERAL'].includes(upper)) {
        return upper;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function getLocalWallOfHeroesData(): {
  total_peserta: number;
  total_partisipan_jersey: number;
  peserta_terdaftar: Array<{
    id: string;
    nama_lengkap: string;
    komunitas: string;
    nomor_bib: number;
    jenis_registrasi: string;
    status_pembayaran: string | null;
    is_jersey_lunas: boolean;
    created_at: string;
  }>;
  partisipan_jersey: Array<{
    id: string;
    nama_lengkap: string;
    komunitas: string;
    nomor_bib: number;
    jersey_spec_str: string;
    created_at: string;
  }>;
  top_komunitas: Array<{ nama: string; jumlah: number }>;
  daftar_komunitas: string[];
} {
  const db = readDB();

  // Calculate PO mappings
  const poMap = new Map<string, JerseyPO>();
  const lunasPoMap = new Map<string, JerseyPO>();
  db.jersey_pos.forEach(po => {
    poMap.set(po.registrant_id, po);
    if (po.status_pembayaran === 'lunas') {
      lunasPoMap.set(po.registrant_id, po);
    }
  });

  const total_peserta = db.registrants.length;
  const total_partisipan_jersey = lunasPoMap.size;

  const peserta_terdaftar = db.registrants.map(r => {
    const po = poMap.get(r.id);
    const batch_produksi = po ? (po.batch_produksi !== undefined && po.batch_produksi !== null ? po.batch_produksi : (r.nomor_bib <= 1184 ? 1 : null)) : null;
    return {
      id: r.id,
      nama_lengkap: r.nama_lengkap,
      komunitas: normalizeCommunityName(r.komunitas),
      nomor_bib: r.nomor_bib,
      jenis_registrasi: r.jenis_registrasi,
      status_pembayaran: po ? po.status_pembayaran : null,
      is_jersey_lunas: lunasPoMap.has(r.id),
      batch_produksi,
      created_at: r.created_at
    };
  });

  const partisipan_jersey: Array<{
    id: string;
    nama_lengkap: string;
    komunitas: string;
    nomor_bib: number;
    jersey_spec_str: string;
    batch_produksi?: number | null;
    created_at: string;
  }> = [];

  db.registrants.forEach(r => {
    const po = lunasPoMap.get(r.id);
    if (po) {
      const sleeveText = po.jenis_lengan === 'short_sleeve' ? 'Pendek' : 'Panjang';
      const isAnak = po.kategori_ukuran === 'anak' || (po.ukuran && String(po.ukuran).toLowerCase().includes('kids'));
      const cleanSize = String(po.ukuran || 'L').replace(/kids\s*/i, '').trim();
      const katPrefix = isAnak ? 'Anak ' : '';
      const qtySuffix = (po.qty && po.qty > 1) ? ` (${po.qty}x)` : '';
      const jersey_spec_str = `${katPrefix}${sleeveText} • ${cleanSize}${qtySuffix}`;
      const batch_produksi = po.batch_produksi !== undefined && po.batch_produksi !== null ? po.batch_produksi : (r.nomor_bib <= 1184 ? 1 : null);
      partisipan_jersey.push({
        id: r.id,
        nama_lengkap: r.nama_lengkap,
        komunitas: normalizeCommunityName(r.komunitas),
        nomor_bib: r.nomor_bib,
        jersey_spec_str,
        batch_produksi,
        created_at: r.created_at
      });
    }
  });

  // Calculate Top Communities & Unique List
  const commCounts: { [key: string]: number } = {};
  const uniqueCommSet = new Set<string>();

  db.registrants.forEach(r => {
    const norm = normalizeCommunityName(r.komunitas);
    if (norm !== 'Umum') {
      commCounts[norm] = (commCounts[norm] || 0) + 1;
      uniqueCommSet.add(norm);
    }
  });

  const top_komunitas = Object.entries(commCounts)
    .map(([nama, jumlah]) => ({ nama, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 5);

  const daftar_komunitas = Array.from(uniqueCommSet).sort((a, b) => a.localeCompare(b));

  return {
    total_peserta,
    total_partisipan_jersey,
    peserta_terdaftar,
    partisipan_jersey,
    top_komunitas,
    daftar_komunitas
  };
}

function getLocalAllAdminData(): {
  registrants_with_po: Array<{
    registrant: Registrant;
    jersey_po?: JerseyPO;
  }>;
  settings: Settings;
  admins: AdminUser[];
} {
  const db = readDB();
  const result = db.registrants.map(reg => {
    let po = db.jersey_pos.find(p => p.registrant_id === reg.id);
    if (po) {
      if (po.batch_produksi === undefined) {
        po.batch_produksi = reg.nomor_bib <= 1184 ? 1 : null;
      }
    }
    return {
      registrant: reg,
      jersey_po: po
    };
  });

  return {
    registrants_with_po: result,
    settings: db.settings,
    admins: db.admins
  };
}

// =========================================================================
// UNIVERSAL EXPORTED FUNCTIONS (Connects to Supabase or Falls back to Local)
// =========================================================================

export async function getSettings(): Promise<Settings> {
  if (isSupabaseConfigured()) {
    const s = await getSupabaseSettings();
    if (s) return s;
  }
  return getLocalSettings();
}

export async function updateSettings(newSettings: Partial<Settings>): Promise<Settings> {
  if (isSupabaseConfigured()) {
    const s = await updateSupabaseSettings(newSettings);
    if (s) return s;
  }
  return updateLocalSettings(newSettings);
}

export async function getAdmins(): Promise<AdminUser[]> {
  if (isSupabaseConfigured()) {
    const a = await getSupabaseAdmins();
    if (a && a.length > 0) return a;
  }
  return getLocalAdmins();
}

export async function createAdminUser(data: {
  email_login: string;
  password?: string;
  pihak: 'rudeboys' | 'peaderal';
  nama_pic: string;
  kontak_pic: string;
}): Promise<AdminUser> {
  if (isSupabaseConfigured()) {
    const a = await createSupabaseAdminUser(data);
    if (a) return a;
  }
  return createLocalAdminUser(data);
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const success = await deleteSupabaseAdminUser(id);
    if (success) return true;
  }
  return deleteLocalAdminUser(id);
}

export async function updateAdminProfile(id: string, nama_pic: string, kontak_pic: string): Promise<AdminUser | null> {
  if (isSupabaseConfigured()) {
    const a = await updateSupabaseAdminProfile(id, nama_pic, kontak_pic);
    if (a) return a;
  }
  return updateLocalAdminProfile(id, nama_pic, kontak_pic);
}

export async function registerParticipant(data: {
  nama_lengkap: string;
  alamat_lengkap: string;
  no_telepon: string;
  no_telepon_kerabat?: string;
  komunitas?: string;
  jenis_registrasi: 'daftar_saja' | 'po_jersey';
  consent_data: boolean;
  consent_waiver: boolean;
  consent_no_refund?: boolean;
  jersey_spec?: {
    kategori_ukuran?: JerseyKategori;
    jenis_lengan: 'short_sleeve' | 'long_sleeve';
    ukuran: JerseySize;
    qty: number;
    metode_ambil: 'ambil_langsung' | 'dikirim';
    alamat_pengiriman?: string;
  };
}): Promise<{ registrant: Registrant; jersey_po?: JerseyPO }> {
  if (isSupabaseConfigured()) {
    const res = await registerSupabaseParticipant(data);
    if (res) return res;
  }
  return registerLocalParticipant(data);
}

export async function addLateJerseyPO(registrantIdOrNo: string, jerseySpec: {
  kategori_ukuran?: JerseyKategori;
  jenis_lengan: 'short_sleeve' | 'long_sleeve';
  ukuran: JerseySize;
  qty: number;
  metode_ambil: 'ambil_langsung' | 'dikirim';
  alamat_pengiriman?: string;
  consent_no_refund: boolean;
}): Promise<{ registrant: Registrant; jersey_po?: JerseyPO } | null> {
  if (isSupabaseConfigured()) {
    const res = await addSupabaseLateJerseyPO(registrantIdOrNo, jerseySpec);
    if (res) return res;
  }
  return addLateLocalJerseyPO(registrantIdOrNo, jerseySpec);
}

export async function uploadPaymentProof(nomorRegistrasi: string, buktiUrl: string): Promise<JerseyPO | null> {
  if (isSupabaseConfigured()) {
    const res = await uploadSupabasePaymentProof(nomorRegistrasi, buktiUrl);
    if (res) return res;
  }
  return uploadLocalPaymentProof(nomorRegistrasi, buktiUrl);
}

export async function getRegistrationDetails(nomorRegistrasi: string): Promise<{ registrant: Registrant; jersey_po?: JerseyPO; settings: Settings } | null> {
  if (isSupabaseConfigured()) {
    const res = await getSupabaseRegistrationDetails(nomorRegistrasi);
    if (res) return res;
  }
  return getLocalRegistrationDetails(nomorRegistrasi);
}

export async function getBibLookup(nomorBib: number): Promise<BibLookupParticipant | null> {
  if (isSupabaseConfigured()) {
    return getSupabaseBibLookup(nomorBib);
  }
  return getLocalBibLookup(nomorBib);
}

export async function updatePaymentStatus(
  poId: string, 
  status: 'lunas' | 'menunggu_verifikasi' | 'perlu_klarifikasi' | 'kedaluwarsa',
  verifiedBy: string = 'Admin',
  catatanAdmin: string = ''
): Promise<JerseyPO | null> {
  if (isSupabaseConfigured()) {
    const res = await updateSupabasePaymentStatus(poId, status, verifiedBy, catatanAdmin);
    if (res) return res;
  }
  return updateLocalPaymentStatus(poId, status, verifiedBy, catatanAdmin);
}

export async function getWallOfHeroesData(): Promise<{
  total_peserta: number;
  total_partisipan_jersey: number;
  peserta_terdaftar: Array<{
    id: string;
    nama_lengkap: string;
    komunitas: string;
    nomor_bib: number;
    is_jersey_lunas: boolean;
    batch_produksi?: number | null;
    created_at: string;
  }>;
  partisipan_jersey: Array<{
    id: string;
    nama_lengkap: string;
    komunitas: string;
    nomor_bib: number;
    jersey_spec_str: string;
    batch_produksi?: number | null;
    created_at: string;
  }>;
  top_komunitas: Array<{ nama: string; jumlah: number }>;
  daftar_komunitas?: string[];
}> {
  if (isSupabaseConfigured()) {
    const res = await getSupabaseWallOfHeroesData();
    if (res) return res;
  }
  return getLocalWallOfHeroesData();
}

export async function getAllAdminData(): Promise<{
  registrants_with_po: Array<{
    registrant: Registrant;
    jersey_po?: JerseyPO;
  }>;
  settings: Settings;
  admins: AdminUser[];
}> {
  if (isSupabaseConfigured()) {
    const res = await getSupabaseAllAdminData();
    if (res) return res;
  }
  return getLocalAllAdminData();
}

export async function deleteRegistrant(registrantId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const res = await deleteSupabaseRegistrant(registrantId);
    if (res) return true;
  }
  return deleteLocalRegistrant(registrantId);
}

export async function deleteJerseyPO(poId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const res = await deleteSupabaseJerseyPO(poId);
    if (res) return true;
  }
  return deleteLocalJerseyPO(poId);
}

export async function updateRegistrantAndPO(data: {
  registrantId: string;
  nama_lengkap?: string;
  komunitas?: string;
  no_telepon?: string;
  no_telepon_kerabat?: string;
  alamat_lengkap?: string;
  po_id?: string;
  kategori_ukuran?: JerseyKategori;
  jenis_lengan?: 'short_sleeve' | 'long_sleeve';
  ukuran?: JerseySize;
  qty?: number;
  metode_ambil?: 'ambil_langsung' | 'dikirim';
  alamat_pengiriman?: string;
  status_pembayaran?: 'menunggu_verifikasi' | 'lunas' | 'perlu_klarifikasi' | 'kedaluwarsa';
  bukti_transfer_url?: string;
  batch_produksi?: number | null;
}): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const res = await updateSupabaseRegistrantAndPO(data);
    if (res) return true;
  }
  return updateLocalRegistrantAndPO(data);
}

function deleteLocalRegistrant(registrantId: string): boolean {
  const db = readDB();
  const regIdx = db.registrants.findIndex(r => r.id === registrantId);
  if (regIdx === -1) return false;

  db.registrants.splice(regIdx, 1);
  db.jersey_pos = db.jersey_pos.filter(p => p.registrant_id !== registrantId);
  writeDB(db);
  return true;
}

function deleteLocalJerseyPO(poId: string): boolean {
  const db = readDB();
  const poIdx = db.jersey_pos.findIndex(p => p.id === poId);
  if (poIdx === -1) return false;

  const po = db.jersey_pos[poIdx];
  const regIdx = db.registrants.findIndex(r => r.id === po.registrant_id);
  if (regIdx !== -1) {
    db.registrants[regIdx].jenis_registrasi = 'daftar_saja';
  }

  db.jersey_pos.splice(poIdx, 1);
  writeDB(db);
  return true;
}

function updateLocalRegistrantAndPO(data: {
  registrantId: string;
  nama_lengkap?: string;
  komunitas?: string;
  no_telepon?: string;
  no_telepon_kerabat?: string;
  alamat_lengkap?: string;
  po_id?: string;
  kategori_ukuran?: JerseyKategori;
  jenis_lengan?: 'short_sleeve' | 'long_sleeve';
  ukuran?: JerseySize;
  qty?: number;
  metode_ambil?: 'ambil_langsung' | 'dikirim';
  alamat_pengiriman?: string;
  status_pembayaran?: 'menunggu_verifikasi' | 'lunas' | 'perlu_klarifikasi' | 'kedaluwarsa';
  bukti_transfer_url?: string;
  batch_produksi?: number | null;
}): boolean {
  const db = readDB();
  const regIdx = db.registrants.findIndex(r => r.id === data.registrantId);
  if (regIdx === -1) return false;

  const reg = db.registrants[regIdx];
  if (data.nama_lengkap !== undefined) reg.nama_lengkap = data.nama_lengkap.trim();
  if (data.komunitas !== undefined) reg.komunitas = data.komunitas.trim() || 'Umum';
  if (data.no_telepon !== undefined) reg.no_telepon = data.no_telepon.trim();
  if (data.no_telepon_kerabat !== undefined) reg.no_telepon_kerabat = data.no_telepon_kerabat.trim();
  if (data.alamat_lengkap !== undefined) reg.alamat_lengkap = data.alamat_lengkap.trim();

  const poIdx = db.jersey_pos.findIndex(p => p.registrant_id === data.registrantId || (data.po_id && p.id === data.po_id));
  if (poIdx !== -1) {
    const po = db.jersey_pos[poIdx];
    if (data.kategori_ukuran !== undefined) po.kategori_ukuran = data.kategori_ukuran;
    if (data.jenis_lengan !== undefined) po.jenis_lengan = data.jenis_lengan;
    if (data.ukuran !== undefined) po.ukuran = data.ukuran;
    if (data.qty !== undefined) po.qty = data.qty;
    if (data.metode_ambil !== undefined) po.metode_ambil = data.metode_ambil;
    if (data.alamat_pengiriman !== undefined) po.alamat_pengiriman = data.alamat_pengiriman;
    if (data.status_pembayaran !== undefined) {
      po.status_pembayaran = data.status_pembayaran;
      if (data.status_pembayaran === 'lunas' && !po.paid_at) {
        po.paid_at = new Date().toISOString();
      }
    }
    if (data.bukti_transfer_url !== undefined) po.bukti_transfer_url = data.bukti_transfer_url;
    if (data.batch_produksi !== undefined) po.batch_produksi = data.batch_produksi;

    const hargaSatuan = po.jenis_lengan === 'short_sleeve'
      ? db.settings.harga_short_sleeve
      : db.settings.harga_long_sleeve;
    po.harga_satuan = hargaSatuan;
    po.harga_total = hargaSatuan * po.qty;
  }

  writeDB(db);
  return true;
}

export function updateLocalCheckInStatus(
  registrantId: string,
  isCheckedIn: boolean,
  checkedInBy: string = 'Panitia'
): boolean {
  const db = readDB();
  const reg = db.registrants.find(r => r.id === registrantId);
  if (!reg) return false;

  reg.is_checked_in = isCheckedIn;
  reg.checked_in_at = isCheckedIn ? new Date().toISOString() : null;
  reg.checked_in_by = isCheckedIn ? checkedInBy : null;

  writeDB(db);
  return true;
}

export function updateLocalShippingStatus(
  poId: string,
  isShipped: boolean,
  shippedBy: string = 'Panitia',
  noResi?: string
): boolean {
  const db = readDB();
  const po = db.jersey_pos.find(p => p.id === poId);
  if (!po) return false;

  po.is_shipped = isShipped;
  po.shipped_at = isShipped ? new Date().toISOString() : null;
  po.shipped_by = isShipped ? shippedBy : null;
  if (noResi !== undefined) {
    po.no_resi = noResi.trim() || null;
  }

  writeDB(db);
  return true;
}

export function updateLocalJerseyBatch(
  poIdOrRegistrantId: string,
  batchNumber: number | null
): boolean {
  const db = readDB();
  const po = db.jersey_pos.find(p => p.id === poIdOrRegistrantId || p.registrant_id === poIdOrRegistrantId);
  if (!po) return false;
  po.batch_produksi = batchNumber;
  writeDB(db);
  return true;
}

export function assignLocalUnbatchedToBatch(batchNumber: number): number {
  const db = readDB();
  let count = 0;
  const regMap = new Map(db.registrants.map(r => [r.id, r]));

  db.jersey_pos.forEach(po => {
    const reg = regMap.get(po.registrant_id);
    const isBatch1Default = reg && reg.nomor_bib <= 1184;
    const currentBatch = po.batch_produksi !== undefined ? po.batch_produksi : (isBatch1Default ? 1 : null);
    
    if (currentBatch === null) {
      po.batch_produksi = batchNumber;
      count++;
    }
  });

  if (count > 0) {
    writeDB(db);
  }
  return count;
}

export async function updateParticipantCheckIn(
  registrantId: string,
  isCheckedIn: boolean,
  checkedInBy: string = 'Panitia'
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return await updateSupabaseCheckInStatus(registrantId, isCheckedIn, checkedInBy);
  }
  return updateLocalCheckInStatus(registrantId, isCheckedIn, checkedInBy);
}

export async function updateJerseyShipping(
  poId: string,
  isShipped: boolean,
  shippedBy: string = 'Panitia',
  noResi?: string
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return await updateSupabaseShippingStatus(poId, isShipped, shippedBy, noResi);
  }
  return updateLocalShippingStatus(poId, isShipped, shippedBy, noResi);
}

export async function updateJerseyBatch(
  poIdOrRegistrantId: string,
  batchNumber: number | null
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return await updateSupabaseJerseyBatch(poIdOrRegistrantId, batchNumber);
  }
  return updateLocalJerseyBatch(poIdOrRegistrantId, batchNumber);
}

export async function assignUnbatchedToBatch(batchNumber: number): Promise<number> {
  if (isSupabaseConfigured()) {
    return await assignSupabaseUnbatchedToBatch(batchNumber);
  }
  return assignLocalUnbatchedToBatch(batchNumber);
}

// ==========================================
// LOCAL EXPENSES FUNCTIONS
// ==========================================
function getLocalExpenses(): Expense[] {
  const db = readDB();
  return (db.expenses || []).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
}

function addLocalExpense(data: Omit<Expense, 'id' | 'created_at'> & { id?: string; created_at?: string }): Expense {
  const db = readDB();
  if (!db.expenses) db.expenses = [];
  
  const id = data.id || 'exp_' + Math.random().toString(36).substring(2, 9);
  const created_at = data.created_at || new Date().toISOString();
  const expense: Expense = {
    ...data,
    id,
    created_at,
    harga_total: data.harga_total !== undefined ? data.harga_total : (data.qty * data.harga_satuan)
  };

  db.expenses.unshift(expense);
  writeDB(db);
  return expense;
}

function updateLocalExpense(id: string, updates: Partial<Expense>): boolean {
  const db = readDB();
  if (!db.expenses) return false;
  const idx = db.expenses.findIndex(e => e.id === id);
  if (idx === -1) return false;

  const current = db.expenses[idx];
  const updated: Expense = {
    ...current,
    ...updates,
    harga_total: updates.harga_total !== undefined 
      ? updates.harga_total 
      : ((updates.qty !== undefined ? updates.qty : current.qty) * (updates.harga_satuan !== undefined ? updates.harga_satuan : current.harga_satuan))
  };

  db.expenses[idx] = updated;
  writeDB(db);
  return true;
}

function deleteLocalExpense(id: string): boolean {
  const db = readDB();
  if (!db.expenses) return false;
  const initLen = db.expenses.length;
  db.expenses = db.expenses.filter(e => e.id !== id);
  if (db.expenses.length !== initLen) {
    writeDB(db);
    return true;
  }
  return false;
}

// ==========================================
// UNIVERSAL EXPORTED FINANCE FUNCTIONS
// ==========================================
export async function getExpenses(): Promise<Expense[]> {
  if (isSupabaseConfigured()) {
    try {
      const supaExpenses = await getSupabaseExpenses();
      return supaExpenses || [];
    } catch (e) {
      console.warn('Error fetching Supabase expenses:', e);
    }
  }
  return getLocalExpenses();
}

export async function addExpense(data: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
  const newId = 'exp_' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();
  const fullExpense: Expense = {
    ...data,
    id: newId,
    created_at: now,
    harga_total: data.harga_total !== undefined ? data.harga_total : (data.qty * data.harga_satuan)
  };

  if (isSupabaseConfigured()) {
    const res = await addSupabaseExpense(fullExpense);
    if (res) {
      addLocalExpense(res);
      return res;
    }
  }
  return addLocalExpense(fullExpense);
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<boolean> {
  let ok = false;
  if (isSupabaseConfigured()) {
    ok = await updateSupabaseExpense(id, updates);
  }
  const localOk = updateLocalExpense(id, updates);
  return ok || localOk;
}

export async function deleteExpense(id: string): Promise<boolean> {
  let ok = false;
  if (isSupabaseConfigured()) {
    ok = await deleteSupabaseExpense(id);
  }
  const localOk = deleteLocalExpense(id);
  return ok || localOk;
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const { registrants_with_po } = await getAllAdminData();
  const expenses = await getExpenses();

  let total_pemasukan_lunas = 0;
  let total_qty_jersey_lunas = 0;
  let total_estimasi_pending = 0;
  let total_qty_jersey_pending = 0;
  const recent_pemasukan: Array<{
    id: string;
    nama_lengkap: string;
    nomor_bib: number;
    komunitas: string;
    jersey_spec_str: string;
    harga_total: number;
    paid_at?: string;
  }> = [];

  registrants_with_po.forEach(({ registrant: r, jersey_po: p }) => {
    if (!p) return;
    const qty = p.qty || 1;
    const total = p.harga_total || 0;

    if (p.status_pembayaran === 'lunas') {
      total_pemasukan_lunas += total;
      total_qty_jersey_lunas += qty;

      const sleeve = p.jenis_lengan === 'short_sleeve' ? 'Short Sleeve' : 'Long Sleeve';
      const kat = p.kategori_ukuran === 'anak' ? ' (Anak)' : '';
      recent_pemasukan.push({
        id: p.id,
        nama_lengkap: r.nama_lengkap,
        nomor_bib: r.nomor_bib,
        komunitas: r.komunitas || 'Umum',
        jersey_spec_str: `Jersey ${sleeve}${kat} Size ${p.ukuran} (${qty}x)`,
        harga_total: total,
        paid_at: p.paid_at || p.verified_at || r.created_at
      });
    } else if (p.status_pembayaran === 'menunggu_verifikasi' || p.status_pembayaran === 'perlu_klarifikasi') {
      // Sesuai instruksi: estimasi pending TIDAK dimasukkan ke total_pemasukan_lunas
      total_estimasi_pending += total;
      total_qty_jersey_pending += qty;
    }
  });

  const total_pengeluaran = expenses.reduce((acc, e) => acc + (e.harga_total || 0), 0);
  const saldo_kas = total_pemasukan_lunas - total_pengeluaran;

  recent_pemasukan.sort((a, b) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime());

  return {
    total_pemasukan_lunas,
    total_qty_jersey_lunas,
    total_estimasi_pending,
    total_qty_jersey_pending,
    total_pengeluaran,
    saldo_kas,
    expenses,
    recent_pemasukan
  };
}

