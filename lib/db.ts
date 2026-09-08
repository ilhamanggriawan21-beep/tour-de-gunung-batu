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
  created_at: string;
}

export interface JerseyPO {
  id: string;
  registrant_id: string;
  jenis_lengan: 'short_sleeve' | 'long_sleeve';
  ukuran: 'S' | 'M' | 'L' | 'XL' | 'XXL';
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

interface DBData {
  last_bib: number;
  registrants: Registrant[];
  jersey_pos: JerseyPO[];
  settings: Settings;
  admins: AdminUser[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

const DEFAULT_SETTINGS: Settings = {
  harga_short_sleeve: 175000,
  harga_long_sleeve: 185000,
  qris_image_url: '/qris-peaderal.png',
  nomor_rekening: '5220394811',
  nama_bank: 'BCA',
  nama_pemilik_rekening: 'PERGERAKAN SEPEDAH PEADERAL',
  tanggal_tutup_po: '2026-09-20T23:59:59',
  tanggal_tutup_pendaftaran: '2026-09-25T23:59:59',
  kontak_wa_panitia: '6281298765432'
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
        admins: DEFAULT_ADMINS
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.settings) data.settings = DEFAULT_SETTINGS;
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
      admins: DEFAULT_ADMINS
    };
  }
}

function writeDB(data: DBData): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
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
  getSupabaseAllAdminData
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
    jenis_lengan: 'short_sleeve' | 'long_sleeve';
    ukuran: 'S' | 'M' | 'L' | 'XL' | 'XXL';
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
  jenis_lengan: 'short_sleeve' | 'long_sleeve';
  ukuran: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  qty: number;
  metode_ambil: 'ambil_langsung' | 'dikirim';
  alamat_pengiriman?: string;
  consent_no_refund: boolean;
}): { registrant: Registrant; jersey_po: JerseyPO } | null {
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
  return {
    registrant: reg,
    jersey_po: po,
    settings: db.settings
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

function getLocalWallOfHeroesData(): {
  total_peserta: number;
  total_partisipan_jersey: number;
  peserta_terdaftar: Array<{
    id: string;
    nama_lengkap: string;
    komunitas: string;
    nomor_bib: number;
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
    return {
      id: r.id,
      nama_lengkap: r.nama_lengkap,
      komunitas: r.komunitas || 'Umum',
      nomor_bib: r.nomor_bib,
      jenis_registrasi: r.jenis_registrasi,
      status_pembayaran: po ? po.status_pembayaran : null,
      is_jersey_lunas: lunasPoMap.has(r.id),
      created_at: r.created_at
    };
  });

  const partisipan_jersey: Array<{
    id: string;
    nama_lengkap: string;
    komunitas: string;
    nomor_bib: number;
    jersey_spec_str: string;
    created_at: string;
  }> = [];

  db.registrants.forEach(r => {
    const po = lunasPoMap.get(r.id);
    if (po) {
      const sleeveStr = po.jenis_lengan === 'short_sleeve' ? 'Short Sleeve' : 'Long Sleeve';
      partisipan_jersey.push({
        id: r.id,
        nama_lengkap: r.nama_lengkap,
        komunitas: r.komunitas || 'Umum',
        nomor_bib: r.nomor_bib,
        jersey_spec_str: `Jersey ${sleeveStr} Size ${po.ukuran} (${po.qty}x)`,
        created_at: r.created_at
      });
    }
  });

  // Calculate Top 5 Communities
  const commCounts: { [key: string]: number } = {};
  db.registrants.forEach(r => {
    const k = r.komunitas || 'Umum';
    commCounts[k] = (commCounts[k] || 0) + 1;
  });

  const top_komunitas = Object.entries(commCounts)
    .map(([nama, jumlah]) => ({ nama, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 5);

  return {
    total_peserta,
    total_partisipan_jersey,
    peserta_terdaftar,
    partisipan_jersey,
    top_komunitas
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
    const po = db.jersey_pos.find(p => p.registrant_id === reg.id);
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
    jenis_lengan: 'short_sleeve' | 'long_sleeve';
    ukuran: 'S' | 'M' | 'L' | 'XL' | 'XXL';
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
  jenis_lengan: 'short_sleeve' | 'long_sleeve';
  ukuran: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  qty: number;
  metode_ambil: 'ambil_langsung' | 'dikirim';
  alamat_pengiriman?: string;
  consent_no_refund: boolean;
}): Promise<{ registrant: Registrant; jersey_po: JerseyPO } | null> {
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
