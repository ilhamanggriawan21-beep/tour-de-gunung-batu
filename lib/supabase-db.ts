import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';
import { normalizeCommunityName, type Registrant, type JerseyPO, type Settings, type AdminUser, type BibLookupParticipant, type JerseyKategori, type JerseySize, type Expense } from './db';

// ==========================================
// 1. SETTINGS
// ==========================================
export async function getSupabaseSettings(): Promise<Settings | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (error || !data) return null;
  return data as Settings;
}

export async function updateSupabaseSettings(newSettings: Partial<Settings>): Promise<Settings | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('settings')
    .update({ ...newSettings, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error || !data) return null;
  return data as Settings;
}

// ==========================================
// 2. ADMIN USERS
// ==========================================
const SEED_ADMINS: Array<{
  id: string;
  email_login: string;
  password?: string;
  pihak: 'rudeboys' | 'peaderal' | 'superadmin';
  role?: 'superadmin' | 'pic';
  nama_pic: string;
  kontak_pic: string;
}> = [
  { id: 'adm-super', email_login: 'admin.tourdegunungbatu.com', password: 'P@ssw0rd', pihak: 'superadmin', role: 'superadmin', nama_pic: 'Admin Utama (Superadmin)', kontak_pic: '081298765432' },
  { id: 'adm-rudeboys', email_login: 'rudeboys@tourdegunungbatu.com', password: 'admin123', pihak: 'rudeboys', role: 'pic', nama_pic: 'PIC Rudeboys Cyclist', kontak_pic: '08123456789' },
  { id: 'adm-peaderal', email_login: 'peaderal@tourdegunungbatu.com', password: 'admin123', pihak: 'peaderal', role: 'pic', nama_pic: 'PIC Pergerakan PEADERAL', kontak_pic: '08987654321' },
  { id: 'adm-weni', email_login: 'weni@tourdegunungbatu.com', password: 'rudeboystdgb', pihak: 'rudeboys', role: 'pic', nama_pic: 'Weni (Panitia TDGB)', kontak_pic: '0812000001' },
  { id: 'adm-bungs', email_login: 'bungs@tourdegunungbatu.com', password: 'rudeboystdgb', pihak: 'rudeboys', role: 'pic', nama_pic: 'Bungs (Panitia TDGB)', kontak_pic: '0812000002' },
  { id: 'adm-lina', email_login: 'lina@tourdegunungbatu.com', password: 'rudeboystdgb', pihak: 'rudeboys', role: 'pic', nama_pic: 'Lina (Panitia TDGB)', kontak_pic: '0812000003' },
  { id: 'adm-mumu', email_login: 'mumu@tourdegunungbatu.com', password: 'rudeboystdgb', pihak: 'rudeboys', role: 'pic', nama_pic: 'Mumu (Panitia TDGB)', kontak_pic: '0812000004' },
  { id: 'adm-tia', email_login: 'tia@tourdegunungbatu.com', password: 'rudeboystdgb', pihak: 'rudeboys', role: 'pic', nama_pic: 'Tia (Panitia TDGB)', kontak_pic: '0812000005' },
  { id: 'adm-desi', email_login: 'desi@tourdegunungbatu.com', password: 'rudeboystdgb', pihak: 'rudeboys', role: 'pic', nama_pic: 'Desi (Panitia TDGB)', kontak_pic: '0812000006' }
];

export async function getSupabaseAdmins(): Promise<AdminUser[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .neq('id', 'adm_expenses_backup')
    .order('created_at', { ascending: true });
  if (error || !data) return [];

  const safeAdmins = data.filter((a: any) => a.id !== 'adm_expenses_backup' && !a.email_login?.includes('system.internal'));
  
  const existingEmails = new Set(safeAdmins.map((a: any) => a.email_login.toLowerCase().trim()));
  const missingSeeds = SEED_ADMINS.filter(s => !existingEmails.has(s.email_login.toLowerCase().trim()));

  if (missingSeeds.length > 0) {
    try {
      const recordsToInsert = missingSeeds.map(s => ({
        id: s.id,
        email_login: s.email_login,
        password: s.password,
        pihak: s.pihak,
        role: s.role || 'pic',
        nama_pic: s.nama_pic,
        kontak_pic: s.kontak_pic,
        created_at: new Date().toISOString()
      }));
      await supabase.from('admin_users').insert(recordsToInsert);
      const { data: updated } = await supabase.from('admin_users').select('*').neq('id', 'adm_expenses_backup').order('created_at', { ascending: true });
      if (updated) return updated.filter((a: any) => a.id !== 'adm_expenses_backup' && !a.email_login?.includes('system.internal')) as AdminUser[];
    } catch (e) {
      console.warn('Auto-seed admins warning:', e);
    }
  }

  return safeAdmins as AdminUser[];
}

export async function createSupabaseAdminUser(data: {
  email_login: string;
  password?: string;
  pihak: 'rudeboys' | 'peaderal';
  nama_pic: string;
  kontak_pic: string;
}): Promise<AdminUser | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const newAdmin = {
    id: 'adm_' + Math.random().toString(36).substring(2, 9),
    email_login: data.email_login.trim(),
    password: data.password || 'admin123',
    pihak: data.pihak,
    role: 'pic',
    nama_pic: data.nama_pic.trim(),
    kontak_pic: data.kontak_pic.trim(),
    created_at: new Date().toISOString()
  };

  const { data: inserted, error } = await supabase.from('admin_users').insert(newAdmin).select().single();
  if (error || !inserted) return null;
  return inserted as AdminUser;
}

export async function deleteSupabaseAdminUser(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  // Protect superadmin
  const { data: existing } = await supabase.from('admin_users').select('role').eq('id', id).single();
  if (existing?.role === 'superadmin') return false;

  const { error } = await supabase.from('admin_users').delete().eq('id', id);
  return !error;
}

export async function updateSupabaseAdminProfile(id: string, nama_pic: string, kontak_pic: string): Promise<AdminUser | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('admin_users')
    .update({ nama_pic, kontak_pic })
    .or(`id.eq.${id},email_login.eq.${id}`)
    .select()
    .single();

  if (error || !data) return null;
  return data as AdminUser;
}

// ==========================================
// RESILIENT HELPERS FOR JERSEY_POS
// ==========================================
export function parseJerseyPO(po: any, registrantBib?: number | null): JerseyPO {
  if (!po) return po;
  const parsed = { ...po };
  if (parsed.catatan_admin) {
    const sizeMatch = parsed.catatan_admin.match(/\[REAL_SIZE:([^\]]+)\]/);
    if (sizeMatch) {
      parsed.ukuran = sizeMatch[1];
    }
    const katMatch = parsed.catatan_admin.match(/\[KAT:([^\]]+)\]/);
    if (katMatch) {
      parsed.kategori_ukuran = katMatch[1];
    }
    const batchMatch = parsed.catatan_admin.match(/\[BATCH:([0-9]+|none|unbatched)\]/i);
    if (batchMatch) {
      const bVal = batchMatch[1].toLowerCase();
      if (bVal === 'none' || bVal === 'unbatched') {
        parsed.batch_produksi = null;
      } else {
        parsed.batch_produksi = parseInt(bVal, 10);
      }
    }
  }
  if (!parsed.kategori_ukuran) {
    parsed.kategori_ukuran = 'dewasa';
  }

  // If batch_produksi is still undefined / null, apply business rule:
  // Hanifsyah Aditya (nomor_bib <= 1184) is Batch 1, others are unbatched (null)
  if (parsed.batch_produksi === undefined || parsed.batch_produksi === null) {
    const effectiveBib = registrantBib !== undefined && registrantBib !== null 
      ? registrantBib 
      : (parsed.registrant?.nomor_bib);

    if (effectiveBib !== undefined && effectiveBib !== null) {
      if (effectiveBib <= 1184) {
        parsed.batch_produksi = 1;
      } else {
        parsed.batch_produksi = null;
      }
    }
  }

  return parsed as JerseyPO;
}

export function applyBatchToCatatan(catatan: string = '', batchNum: number | null): string {
  let clean = catatan.replace(/\[BATCH:([^\]]+)\]/gi, '').trim();
  const tag = `[BATCH:${batchNum !== null && batchNum !== undefined ? batchNum : 'none'}]`;
  return clean ? `${tag} ${clean}` : tag;
}

async function safeInsertJerseyPO(supabase: any, poRecord: any): Promise<JerseyPO | null> {
  let currentRecord = { ...poRecord };
  
  if (currentRecord.batch_produksi !== undefined) {
    currentRecord.catatan_admin = applyBatchToCatatan(currentRecord.catatan_admin || '', currentRecord.batch_produksi);
  }

  // Attempt 1: Direct insert with all fields
  let { data, error } = await supabase.from('jersey_pos').insert(currentRecord).select().single();
  if (!error && data) return parseJerseyPO(data);

  // Attempt 2: If batch_produksi column missing in DB schema
  if (error && (error.message?.includes('batch_produksi') || error.details?.includes('batch_produksi') || error.code === 'PGRST204')) {
    delete currentRecord.batch_produksi;
    const res = await supabase.from('jersey_pos').insert(currentRecord).select().single();
    if (!res.error && res.data) return parseJerseyPO(res.data);
    error = res.error;
  }

  // Attempt 3: If kategori_ukuran column missing in DB schema
  if (error && (error.message?.includes('kategori_ukuran') || error.details?.includes('kategori_ukuran') || error.code === 'PGRST204')) {
    const kat = currentRecord.kategori_ukuran || 'dewasa';
    delete currentRecord.kategori_ukuran;
    currentRecord.catatan_admin = `[KAT:${kat}]` + (currentRecord.catatan_admin ? ' ' + currentRecord.catatan_admin : '');
    
    const res2 = await supabase.from('jersey_pos').insert(currentRecord).select().single();
    if (!res2.error && res2.data) return parseJerseyPO(res2.data);
    error = res2.error;
  }

  // Attempt 4: If check constraint on ukuran (e.g. legacy check only allowing S,M,L,XL,XXL)
  if (error && (error.message?.includes('jersey_pos_ukuran_check') || error.details?.includes('jersey_pos_ukuran_check'))) {
    const origSize = currentRecord.ukuran;
    currentRecord.ukuran = 'L'; // Safe standard size to satisfy legacy DB check
    currentRecord.catatan_admin = `[REAL_SIZE:${origSize}]` + (currentRecord.catatan_admin ? ' ' + currentRecord.catatan_admin : '');

    const res3 = await supabase.from('jersey_pos').insert(currentRecord).select().single();
    if (!res3.error && res3.data) return parseJerseyPO(res3.data);
    console.error('All fallback inserts failed for jersey_pos:', res3.error);
  }

  console.error('Failed safeInsertJerseyPO:', error);
  return null;
}

async function safeUpdateJerseyPO(supabase: any, poId: string, poUpdates: any): Promise<boolean> {
  let currentUpdates = { ...poUpdates };

  if (currentUpdates.batch_produksi !== undefined) {
    currentUpdates.catatan_admin = applyBatchToCatatan(currentUpdates.catatan_admin || '', currentUpdates.batch_produksi);
  }

  let { error } = await supabase.from('jersey_pos').update(currentUpdates).eq('id', poId);
  if (!error) return true;

  // If batch_produksi column missing in DB schema
  if (error && (error.message?.includes('batch_produksi') || error.details?.includes('batch_produksi') || error.code === 'PGRST204')) {
    delete currentUpdates.batch_produksi;
    const resBatch = await supabase.from('jersey_pos').update(currentUpdates).eq('id', poId);
    if (!resBatch.error) return true;
    error = resBatch.error;
  }

  // If kategori_ukuran column missing
  if (error && (error.message?.includes('kategori_ukuran') || error.details?.includes('kategori_ukuran') || error.code === 'PGRST204')) {
    const kat = currentUpdates.kategori_ukuran;
    delete currentUpdates.kategori_ukuran;
    if (kat) {
      currentUpdates.catatan_admin = `[KAT:${kat}]` + (currentUpdates.catatan_admin ? ' ' + currentUpdates.catatan_admin : '');
    }
    const res2 = await supabase.from('jersey_pos').update(currentUpdates).eq('id', poId);
    if (!res2.error) return true;
    error = res2.error;
  }

  // If ukuran check constraint failed
  if (error && (error.message?.includes('jersey_pos_ukuran_check') || error.details?.includes('jersey_pos_ukuran_check'))) {
    const origSize = currentUpdates.ukuran;
    currentUpdates.ukuran = 'L';
    if (origSize) {
      currentUpdates.catatan_admin = `[REAL_SIZE:${origSize}]` + (currentUpdates.catatan_admin ? ' ' + currentUpdates.catatan_admin : '');
    }
    const res3 = await supabase.from('jersey_pos').update(currentUpdates).eq('id', poId);
    if (!res3.error) return true;
  }

  console.error('Failed safeUpdateJerseyPO:', error);
  return false;
}

// ==========================================
// 3. REGISTRANT & PARTICIPANT REGISTRATION
// ==========================================
export async function registerSupabaseParticipant(data: {
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
}): Promise<{ registrant: Registrant; jersey_po?: JerseyPO } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  // Get current max bib or use sequence
  const { data: maxBib } = await supabase.from('registrants').select('nomor_bib').order('nomor_bib', { ascending: false }).limit(1);
  const nextBib = (maxBib && maxBib.length > 0 && maxBib[0].nomor_bib >= 1000)
    ? maxBib[0].nomor_bib + 1
    : 1000;

  const regId = 'reg_' + Math.random().toString(36).substring(2, 9);
  const nomorReg = 'TDGB-' + Math.floor(10000 + Math.random() * 90000);

  const regRecord = {
    id: regId,
    nomor_registrasi: nomorReg,
    nomor_bib: nextBib,
    nama_lengkap: data.nama_lengkap.trim(),
    alamat_lengkap: data.alamat_lengkap.trim(),
    no_telepon: data.no_telepon.trim(),
    no_telepon_kerabat: data.no_telepon_kerabat?.trim() || null,
    komunitas: (data.komunitas && data.komunitas.trim()) ? normalizeCommunityName(data.komunitas.trim()) : 'Umum',
    jenis_registrasi: data.jenis_registrasi,
    consent_data: data.consent_data,
    consent_waiver: data.consent_waiver,
    consent_no_refund: data.consent_no_refund || false,
    created_at: new Date().toISOString()
  };

  const { data: insertedReg, error: regError } = await supabase.from('registrants').insert(regRecord).select().single();
  if (regError || !insertedReg) {
    console.error('Supabase reg error:', regError);
    return null;
  }

  let jerseyPO: JerseyPO | undefined = undefined;

  if (data.jenis_registrasi === 'po_jersey' && data.jersey_spec) {
    const settings = await getSupabaseSettings();
    const hargaSatuan = data.jersey_spec.jenis_lengan === 'short_sleeve'
      ? (settings?.harga_short_sleeve || 120000)
      : (settings?.harga_long_sleeve || 135000);

    const poId = 'po_' + Math.random().toString(36).substring(2, 9);
    const poRecord = {
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
      alamat_pengiriman: data.jersey_spec.alamat_pengiriman || null,
      created_at: new Date().toISOString()
    };

    const inserted = await safeInsertJerseyPO(supabase, poRecord);
    if (inserted) {
      jerseyPO = inserted;
    }
  }

  return { registrant: insertedReg as Registrant, jersey_po: jerseyPO };
}

// ==========================================
// 4. SUSULAN PO JERSEY
// ==========================================
export async function addSupabaseLateJerseyPO(registrantIdOrNo: string, jerseySpec: {
  kategori_ukuran?: JerseyKategori;
  jenis_lengan: 'short_sleeve' | 'long_sleeve';
  ukuran: JerseySize;
  qty: number;
  metode_ambil: 'ambil_langsung' | 'dikirim';
  alamat_pengiriman?: string;
  consent_no_refund: boolean;
}): Promise<{ registrant: Registrant; jersey_po: JerseyPO } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  // Find registrant
  const { data: reg } = await supabase
    .from('registrants')
    .select('*')
    .or(`id.eq.${registrantIdOrNo},nomor_registrasi.ilike.${registrantIdOrNo},no_telepon.eq.${registrantIdOrNo}`)
    .limit(1)
    .single();

  if (!reg) return null;

  // Update registrant
  await supabase.from('registrants').update({
    jenis_registrasi: 'po_jersey',
    consent_no_refund: jerseySpec.consent_no_refund
  }).eq('id', reg.id);

  const settings = await getSupabaseSettings();
  const hargaSatuan = jerseySpec.jenis_lengan === 'short_sleeve'
    ? (settings?.harga_short_sleeve || 120000)
    : (settings?.harga_long_sleeve || 135000);

  // Check existing PO
  const { data: existingPo } = await supabase.from('jersey_pos').select('*').eq('registrant_id', reg.id).maybeSingle();

  let finalPo: JerseyPO | null = null;

  if (existingPo) {
    const updatePayload: any = {
      kategori_ukuran: jerseySpec.kategori_ukuran || existingPo.kategori_ukuran || 'dewasa',
      jenis_lengan: jerseySpec.jenis_lengan,
      ukuran: jerseySpec.ukuran,
      qty: jerseySpec.qty,
      harga_satuan: hargaSatuan,
      harga_total: hargaSatuan * jerseySpec.qty,
      metode_ambil: jerseySpec.metode_ambil,
      alamat_pengiriman: jerseySpec.alamat_pengiriman || null,
      status_pembayaran: 'menunggu_verifikasi'
    };
    await safeUpdateJerseyPO(supabase, existingPo.id, updatePayload);
    const { data: refreshedPo } = await supabase.from('jersey_pos').select('*').eq('id', existingPo.id).single();
    finalPo = parseJerseyPO(refreshedPo);
  } else {
    const poId = 'po_' + Math.random().toString(36).substring(2, 9);
    const poRecord = {
      id: poId,
      registrant_id: reg.id,
      kategori_ukuran: jerseySpec.kategori_ukuran || 'dewasa',
      jenis_lengan: jerseySpec.jenis_lengan,
      ukuran: jerseySpec.ukuran,
      qty: jerseySpec.qty,
      harga_satuan: hargaSatuan,
      harga_total: hargaSatuan * jerseySpec.qty,
      status_pembayaran: 'menunggu_verifikasi',
      metode_ambil: jerseySpec.metode_ambil,
      alamat_pengiriman: jerseySpec.alamat_pengiriman || null,
      created_at: new Date().toISOString()
    };
    finalPo = await safeInsertJerseyPO(supabase, poRecord);
  }

  return { registrant: reg as Registrant, jersey_po: finalPo || ({} as JerseyPO) };
}

// ==========================================
// 5. UPLOAD PAYMENT PROOF (Supabase Storage)
// ==========================================
export async function uploadSupabasePaymentProof(nomorRegistrasi: string, buktiUrl: string): Promise<JerseyPO | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  // Find registrant
  const { data: reg } = await supabase
    .from('registrants')
    .select('id')
    .ilike('nomor_registrasi', nomorRegistrasi)
    .single();

  if (!reg) return null;

  let finalUrl = buktiUrl;

  // If buktiUrl is base64 image data URL, upload to Supabase Storage Bucket 'payment-proofs'
  if (buktiUrl.startsWith('data:image/')) {
    try {
      const matches = buktiUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `proof_${nomorRegistrasi}_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, buffer, {
            contentType: `image/${matches[1]}`,
            upsert: true
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
          if (publicData?.publicUrl) {
            finalUrl = publicData.publicUrl;
          }
        }
      }
    } catch (e) {
      console.error('Failed uploading proof to storage:', e);
    }
  }

  // Find or create PO if missing
  let { data: po } = await supabase.from('jersey_pos').select('*').eq('registrant_id', reg.id).maybeSingle();
  if (!po) {
    const poId = 'po_' + Math.random().toString(36).substring(2, 9);
    po = await safeInsertJerseyPO(supabase, {
      id: poId,
      registrant_id: reg.id,
      jenis_lengan: 'short_sleeve',
      ukuran: 'L',
      qty: 1,
      harga_satuan: 120000,
      harga_total: 120000,
      bukti_transfer_url: finalUrl,
      status_pembayaran: 'menunggu_verifikasi',
      metode_ambil: 'ambil_langsung',
      created_at: new Date().toISOString()
    });
    return po;
  }

  const { data: updatedPo, error: updateError } = await supabase
    .from('jersey_pos')
    .update({
      bukti_transfer_url: finalUrl,
      status_pembayaran: 'menunggu_verifikasi'
    })
    .eq('id', po.id)
    .select()
    .single();

  if (updateError || !updatedPo) return null;
  return parseJerseyPO(updatedPo);
}

// ==========================================
// 6. GET REGISTRATION DETAILS
// ==========================================
export async function getSupabaseRegistrationDetails(nomorRegistrasi: string): Promise<{
  registrant: Registrant;
  jersey_po?: JerseyPO;
  settings: Settings;
} | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: reg } = await supabase
    .from('registrants')
    .select('*')
    .or(`id.eq.${nomorRegistrasi},nomor_registrasi.ilike.${nomorRegistrasi},no_telepon.eq.${nomorRegistrasi}`)
    .maybeSingle();

  if (!reg) return null;

  const { data: po } = await supabase
    .from('jersey_pos')
    .select('*')
    .eq('registrant_id', reg.id)
    .maybeSingle();

  const settings = (await getSupabaseSettings()) || {
    harga_short_sleeve: 120000,
    harga_long_sleeve: 135000,
    qris_image_url: '/qris-peaderal.png',
    nomor_rekening: '5220394811',
    nama_bank: 'BCA',
    nama_pemilik_rekening: 'PERGERAKAN SEPEDAH PEADERAL',
    tanggal_tutup_po: '2026-09-20T23:59:59',
    tanggal_tutup_pendaftaran: '2026-09-25T23:59:59',
    kontak_wa_panitia: '6287745870767'
  };

  return {
    registrant: reg as Registrant,
    jersey_po: po ? parseJerseyPO(po, reg.nomor_bib) : undefined,
    settings
  };
}

export async function getSupabaseBibLookup(nomorBib: number): Promise<BibLookupParticipant | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('registrants')
    .select('id, nomor_bib, nama_lengkap, komunitas, nomor_registrasi, jenis_registrasi')
    .eq('nomor_bib', nomorBib)
    .maybeSingle();

  if (error || !data) return null;

  let batch_produksi: number | null = null;
  let status_jersey: string | null = null;

  if (data.jenis_registrasi === 'po_jersey') {
    const { data: poData } = await supabase
      .from('jersey_pos')
      .select('*')
      .eq('registrant_id', data.id)
      .maybeSingle();

    if (poData) {
      const parsedPo = parseJerseyPO(poData, data.nomor_bib);
      status_jersey = parsedPo.status_pembayaran;
      batch_produksi = parsedPo.batch_produksi !== undefined && parsedPo.batch_produksi !== null
        ? parsedPo.batch_produksi
        : (data.nomor_bib <= 1184 ? 1 : null);
    }
  }

  return {
    nomor_bib: data.nomor_bib,
    nama_lengkap: data.nama_lengkap,
    komunitas: data.komunitas,
    nomor_registrasi: data.nomor_registrasi,
    jenis_registrasi: data.jenis_registrasi,
    batch_produksi,
    status_jersey
  };
}

// ==========================================
// 7. UPDATE PAYMENT STATUS
// ==========================================
export async function updateSupabasePaymentStatus(
  poId: string,
  status: 'lunas' | 'menunggu_verifikasi' | 'perlu_klarifikasi' | 'kedaluwarsa',
  verifiedBy: string = 'Admin',
  catatanAdmin: string = ''
): Promise<JerseyPO | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const now = new Date().toISOString();
  const updatePayload: any = {
    status_pembayaran: status,
    verified_by: verifiedBy,
    verified_at: now,
    catatan_admin: catatanAdmin
  };

  if (status === 'lunas') {
    updatePayload.paid_at = now;
  }

  const { data, error } = await supabase
    .from('jersey_pos')
    .update(updatePayload)
    .eq('id', poId)
    .select()
    .single();

  if (error || !data) return null;
  return parseJerseyPO(data);
}

// ==========================================
// 8. WALL OF HEROES DATA
// ==========================================
export async function getSupabaseWallOfHeroesData() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: registrants } = await supabase.from('registrants').select('*').order('nomor_bib', { ascending: true });
  const { data: jersey_pos } = await supabase.from('jersey_pos').select('*');

  const regs = registrants || [];
  const regBibMap = new Map<string, number>();
  regs.forEach((r: any) => {
    if (r.nomor_bib) regBibMap.set(r.id, r.nomor_bib);
  });
  const pos = (jersey_pos || []).map((p: any) => parseJerseyPO(p, regBibMap.get(p.registrant_id)));

  const poMap = new Map<string, any>();
  const lunasPoMap = new Map<string, any>();
  pos.forEach((p: any) => {
    poMap.set(p.registrant_id, p);
    if (p.status_pembayaran === 'lunas') {
      lunasPoMap.set(p.registrant_id, p);
    }
  });

  const peserta_terdaftar = regs.map((r: any) => {
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

  const partisipan_jersey: any[] = [];
  regs.forEach((r: any) => {
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

  const commCounts: { [key: string]: number } = {};
  const uniqueCommSet = new Set<string>();

  regs.forEach((r: any) => {
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
    total_peserta: regs.length,
    total_partisipan_jersey: lunasPoMap.size,
    peserta_terdaftar,
    partisipan_jersey,
    top_komunitas,
    daftar_komunitas
  };
}

// ==========================================
// 9. ALL ADMIN DATA
// ==========================================
export async function getSupabaseAllAdminData() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: regs } = await supabase.from('registrants').select('*').order('nomor_bib', { ascending: true });
  const { data: pos } = await supabase.from('jersey_pos').select('*');
  const settings = await getSupabaseSettings();
  const admins = await getSupabaseAdmins();

  const regBibMap = new Map<string, number>();
  (regs || []).forEach((r: any) => {
    if (r.nomor_bib) regBibMap.set(r.id, r.nomor_bib);
  });

  const posList = (pos || []).map((p: any) => parseJerseyPO(p, regBibMap.get(p.registrant_id)));
  const registrants_with_po = (regs || []).map((reg: any) => {
    let matchingPo = posList.find((p: any) => p.registrant_id === reg.id);
    
    // Auto-synthesize PO for registrants with po_jersey but missing row in jersey_pos
    if (!matchingPo && reg.jenis_registrasi === 'po_jersey') {
      matchingPo = {
        id: 'po_' + reg.id.replace('reg_', ''),
        registrant_id: reg.id,
        kategori_ukuran: 'dewasa',
        jenis_lengan: 'short_sleeve',
        ukuran: 'L',
        qty: 1,
        harga_satuan: settings?.harga_short_sleeve || 120000,
        harga_total: settings?.harga_short_sleeve || 120000,
        status_pembayaran: 'menunggu_verifikasi',
        metode_ambil: 'ambil_langsung',
        created_at: reg.created_at,
        batch_produksi: reg.nomor_bib <= 1184 ? 1 : null
      } as JerseyPO;
    }

    return {
      registrant: reg as Registrant,
      jersey_po: matchingPo
    };
  });

  return {
    registrants_with_po,
    settings: settings || {
      harga_short_sleeve: 120000,
      harga_long_sleeve: 135000,
      qris_image_url: '/qris-peaderal.png',
      nomor_rekening: '5220394811',
      nama_bank: 'BCA',
      nama_pemilik_rekening: 'PERGERAKAN SEPEDAH PEADERAL',
      tanggal_tutup_po: '2026-09-20T23:59:59',
      tanggal_tutup_pendaftaran: '2026-09-25T23:59:59',
      kontak_wa_panitia: '6287745870767'
    },
    admins
  };
}

export async function deleteSupabaseRegistrant(registrantId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  await supabase.from('jersey_pos').delete().eq('registrant_id', registrantId);
  const { error } = await supabase.from('registrants').delete().eq('id', registrantId);
  return !error;
}

export async function deleteSupabaseJerseyPO(poId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data: po } = await supabase.from('jersey_pos').select('registrant_id').eq('id', poId).maybeSingle();
  if (po?.registrant_id) {
    await supabase.from('registrants').update({ jenis_registrasi: 'daftar_saja' }).eq('id', po.registrant_id);
  }

  const { error } = await supabase.from('jersey_pos').delete().eq('id', poId);
  return !error;
}

export async function updateSupabaseRegistrantAndPO(data: {
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
  verified_by?: string;
  batch_produksi?: number | null;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const regUpdates: any = {};
  if (data.nama_lengkap !== undefined) regUpdates.nama_lengkap = data.nama_lengkap.trim();
  if (data.komunitas !== undefined) regUpdates.komunitas = data.komunitas.trim() ? normalizeCommunityName(data.komunitas.trim()) : 'Umum';
  if (data.no_telepon !== undefined) regUpdates.no_telepon = data.no_telepon.trim();
  if (data.no_telepon_kerabat !== undefined) regUpdates.no_telepon_kerabat = data.no_telepon_kerabat.trim();
  if (data.alamat_lengkap !== undefined) regUpdates.alamat_lengkap = data.alamat_lengkap.trim();

  if (Object.keys(regUpdates).length > 0) {
    await supabase.from('registrants').update(regUpdates).eq('id', data.registrantId);
  }

  const { data: po } = await supabase.from('jersey_pos').select('*').or(`registrant_id.eq.${data.registrantId},id.eq.${data.po_id || ''}`).maybeSingle();
  
  const settings = await getSupabaseSettings();

  if (po) {
    const poUpdates: any = {};
    if (data.kategori_ukuran !== undefined) poUpdates.kategori_ukuran = data.kategori_ukuran;
    if (data.jenis_lengan !== undefined) poUpdates.jenis_lengan = data.jenis_lengan;
    if (data.ukuran !== undefined) poUpdates.ukuran = data.ukuran;
    if (data.qty !== undefined) poUpdates.qty = data.qty;
    if (data.metode_ambil !== undefined) poUpdates.metode_ambil = data.metode_ambil;
    if (data.alamat_pengiriman !== undefined) poUpdates.alamat_pengiriman = data.alamat_pengiriman;
    if (data.status_pembayaran !== undefined) {
      poUpdates.status_pembayaran = data.status_pembayaran;
      if (data.status_pembayaran === 'lunas') {
        poUpdates.paid_at = new Date().toISOString();
        poUpdates.verified_at = new Date().toISOString();
        poUpdates.verified_by = data.verified_by || 'Admin';
      }
    }
    if (data.bukti_transfer_url !== undefined) poUpdates.bukti_transfer_url = data.bukti_transfer_url;
    if (data.batch_produksi !== undefined) poUpdates.batch_produksi = data.batch_produksi;

    const jenisLengan = data.jenis_lengan || po.jenis_lengan;
    const qty = data.qty !== undefined ? data.qty : po.qty;
    const hargaSatuan = jenisLengan === 'short_sleeve'
      ? (settings?.harga_short_sleeve || 120000)
      : (settings?.harga_long_sleeve || 135000);

    poUpdates.harga_satuan = hargaSatuan;
    poUpdates.harga_total = hargaSatuan * qty;

    await safeUpdateJerseyPO(supabase, po.id, poUpdates);
  } else {
    // If PO record doesn't exist yet (e.g. orphan po_jersey registrant being edited/verified)
    const poId = data.po_id || ('po_' + Math.random().toString(36).substring(2, 9));
    const jenisLengan = data.jenis_lengan || 'short_sleeve';
    const qty = data.qty || 1;
    const hargaSatuan = jenisLengan === 'short_sleeve'
      ? (settings?.harga_short_sleeve || 120000)
      : (settings?.harga_long_sleeve || 135000);

    const poRecord: any = {
      id: poId,
      registrant_id: data.registrantId,
      kategori_ukuran: data.kategori_ukuran || 'dewasa',
      jenis_lengan: jenisLengan,
      ukuran: data.ukuran || 'L',
      qty: qty,
      harga_satuan: hargaSatuan,
      harga_total: hargaSatuan * qty,
      status_pembayaran: data.status_pembayaran || 'menunggu_verifikasi',
      metode_ambil: data.metode_ambil || 'ambil_langsung',
      alamat_pengiriman: data.alamat_pengiriman || null,
      bukti_transfer_url: data.bukti_transfer_url || null,
      batch_produksi: data.batch_produksi !== undefined ? data.batch_produksi : null,
      created_at: new Date().toISOString()
    };

    if (data.status_pembayaran === 'lunas') {
      poRecord.paid_at = new Date().toISOString();
      poRecord.verified_at = new Date().toISOString();
      poRecord.verified_by = data.verified_by || 'Admin';
    }

    await safeInsertJerseyPO(supabase, poRecord);
    await supabase.from('registrants').update({ jenis_registrasi: 'po_jersey' }).eq('id', data.registrantId);
  }

  return true;
}

// ==========================================
// 10. HARI H CHECK-IN & SHIPPING LOGISTICS
// ==========================================
export async function updateSupabaseCheckInStatus(
  registrantId: string,
  isCheckedIn: boolean,
  checkedInBy: string = 'Panitia'
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const now = new Date().toISOString();
  const updatePayload: any = {
    is_checked_in: isCheckedIn,
    checked_in_at: isCheckedIn ? now : null,
    checked_in_by: isCheckedIn ? checkedInBy : null
  };

  try {
    const { error } = await supabase.from('registrants').update(updatePayload).eq('id', registrantId);
    if (error) {
      console.warn('Supabase checkin error (table might need column migration):', error.message);
      return true;
    }
    return true;
  } catch (e: any) {
    console.error('updateSupabaseCheckInStatus error:', e);
    return false;
  }
}

export async function updateSupabaseShippingStatus(
  poId: string,
  isShipped: boolean,
  shippedBy: string = 'Panitia',
  noResi?: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const now = new Date().toISOString();
  const updatePayload: any = {
    is_shipped: isShipped,
    shipped_at: isShipped ? now : null,
    shipped_by: isShipped ? shippedBy : null,
    ...(noResi !== undefined ? { no_resi: noResi.trim() || null } : {})
  };

  try {
    const { error } = await supabase.from('jersey_pos').update(updatePayload).eq('id', poId);
    if (error) {
      console.warn('Supabase shipping error:', error.message);
      return true;
    }
    return true;
  } catch (e: any) {
    console.error('updateSupabaseShippingStatus error:', e);
    return false;
  }
}

// ==========================================
// 11. BATCH PRODUKSI JERSEY
// ==========================================
export async function updateSupabaseJerseyBatch(
  poIdOrRegistrantId: string,
  batchNumber: number | null
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data: po } = await supabase
    .from('jersey_pos')
    .select('*')
    .or(`id.eq.${poIdOrRegistrantId},registrant_id.eq.${poIdOrRegistrantId}`)
    .maybeSingle();

  if (!po) return false;

  const currentCat = po.catatan_admin || '';
  const newCat = applyBatchToCatatan(currentCat, batchNumber);

  return await safeUpdateJerseyPO(supabase, po.id, {
    batch_produksi: batchNumber,
    catatan_admin: newCat
  });
}

export async function assignSupabaseUnbatchedToBatch(batchNumber: number): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;

  const { data: regs } = await supabase.from('registrants').select('id, nomor_bib');
  const { data: pos } = await supabase.from('jersey_pos').select('*');

  if (!pos || pos.length === 0) return 0;

  const regBibMap = new Map<string, number>();
  (regs || []).forEach((r: any) => {
    if (r.nomor_bib) regBibMap.set(r.id, r.nomor_bib);
  });

  let count = 0;
  for (const po of pos) {
    const bib = regBibMap.get(po.registrant_id);
    const parsed = parseJerseyPO(po, bib);
    
    // Only assign if it is currently unbatched
    if (parsed.batch_produksi === null || parsed.batch_produksi === undefined) {
      const newCat = applyBatchToCatatan(po.catatan_admin || '', batchNumber);
      const success = await safeUpdateJerseyPO(supabase, po.id, {
        batch_produksi: batchNumber,
        catatan_admin: newCat
      });
      if (success) count++;
    }
  }

  return count;
}

// ==========================================
// 12. PENGELUARAN & KEUANGAN (FINANCE)
// ==========================================
const EXPENSES_BACKUP_ID = 'adm_expenses_backup';

export async function uploadExpenseProofToStorage(base64Data: string, filenamePrefix = 'expense'): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    const mimeType = matches[1];
    const base64Str = matches[2];
    const buffer = Buffer.from(base64Str, 'base64');
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';

    const path = `expenses/${filenamePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const { error } = await supabase.storage.from('payment-proofs').upload(path, buffer, {
      contentType: mimeType,
      upsert: true
    });

    if (!error) {
      const { data: pub } = supabase.storage.from('payment-proofs').getPublicUrl(path);
      return pub.publicUrl;
    }
  } catch (e) {
    console.warn('Failed to upload proof to storage:', e);
  }
  return null;
}

async function getBackupExpensesFromAdminUsers(supabase: any): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('kontak_pic')
      .eq('id', EXPENSES_BACKUP_ID)
      .maybeSingle();

    if (!error && data && data.kontak_pic) {
      const parsed = JSON.parse(data.kontak_pic);
      if (Array.isArray(parsed)) return parsed as Expense[];
    }
  } catch (e) {
    console.warn('Failed getBackupExpensesFromAdminUsers:', e);
  }
  return [];
}

async function saveBackupExpensesToAdminUsers(supabase: any, expenses: Expense[]): Promise<boolean> {
  try {
    const { error } = await supabase.from('admin_users').upsert({
      id: EXPENSES_BACKUP_ID,
      email_login: 'finance_storage@system.internal',
      password: 'system_internal_storage',
      pihak: 'superadmin',
      role: 'superadmin',
      nama_pic: 'SYSTEM_FINANCE_STORE',
      kontak_pic: JSON.stringify(expenses)
    });
    return !error;
  } catch (e) {
    console.warn('Failed saveBackupExpensesToAdminUsers:', e);
    return false;
  }
}

export async function getSupabaseExpenses(): Promise<Expense[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.from('expenses').select('*').order('tanggal', { ascending: false });
    if (!error && data) {
      return data as Expense[];
    }
    // Fallback if table 'expenses' does not exist yet
    return await getBackupExpensesFromAdminUsers(supabase);
  } catch (e) {
    console.warn('Supabase expenses query fallback:', e);
  }
  return await getBackupExpensesFromAdminUsers(supabase);
}

export async function addSupabaseExpense(expense: Expense): Promise<Expense | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  // Optimize proof URL by uploading to Supabase storage if base64
  if (expense.bukti_url && expense.bukti_url.startsWith('data:image/')) {
    const pubUrl = await uploadExpenseProofToStorage(expense.bukti_url, expense.id);
    if (pubUrl) {
      expense.bukti_url = pubUrl;
    }
  }

  try {
    const { data, error } = await supabase.from('expenses').insert(expense).select().single();
    if (!error && data) {
      return data as Expense;
    }
    // Fallback: save to admin_users backup store if table 'expenses' does not exist
    const list = await getBackupExpensesFromAdminUsers(supabase);
    const updatedList = [expense, ...list.filter(e => e.id !== expense.id)];
    const ok = await saveBackupExpensesToAdminUsers(supabase, updatedList);
    if (ok) return expense;
  } catch (e) {
    console.warn('Failed addSupabaseExpense:', e);
  }
  return null;
}

export async function updateSupabaseExpense(id: string, updates: Partial<Expense>): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  // Optimize proof URL if base64
  if (updates.bukti_url && updates.bukti_url.startsWith('data:image/')) {
    const pubUrl = await uploadExpenseProofToStorage(updates.bukti_url, id);
    if (pubUrl) {
      updates.bukti_url = pubUrl;
    }
  }

  try {
    const { error } = await supabase.from('expenses').update(updates).eq('id', id);
    if (!error) return true;

    // Fallback: update in backup store
    const list = await getBackupExpensesFromAdminUsers(supabase);
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      return await saveBackupExpensesToAdminUsers(supabase, list);
    }
  } catch (e) {
    return false;
  }
  return false;
}

export async function deleteSupabaseExpense(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) return true;

    // Fallback: delete from backup store
    const list = await getBackupExpensesFromAdminUsers(supabase);
    const filtered = list.filter(e => e.id !== id);
    return await saveBackupExpensesToAdminUsers(supabase, filtered);
  } catch (e) {
    return false;
  }
}

