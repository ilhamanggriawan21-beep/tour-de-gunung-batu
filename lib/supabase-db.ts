import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';
import type { Registrant, JerseyPO, Settings, AdminUser } from './db';

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
export async function getSupabaseAdmins(): Promise<AdminUser[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase.from('admin_users').select('*').order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as AdminUser[];
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
    jenis_lengan: 'short_sleeve' | 'long_sleeve';
    ukuran: 'S' | 'M' | 'L' | 'XL' | 'XXL';
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
    komunitas: (data.komunitas && data.komunitas.trim()) ? data.komunitas.trim() : 'Umum',
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

    const { data: insertedPo, error: poError } = await supabase.from('jersey_pos').insert(poRecord).select().single();
    if (!poError && insertedPo) {
      jerseyPO = insertedPo as JerseyPO;
    }
  }

  return { registrant: insertedReg as Registrant, jersey_po: jerseyPO };
}

// ==========================================
// 4. SUSULAN PO JERSEY
// ==========================================
export async function addSupabaseLateJerseyPO(registrantIdOrNo: string, jerseySpec: {
  jenis_lengan: 'short_sleeve' | 'long_sleeve';
  ukuran: 'S' | 'M' | 'L' | 'XL' | 'XXL';
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

  let finalPo: JerseyPO;

  if (existingPo) {
    const { data: updatedPo } = await supabase.from('jersey_pos').update({
      jenis_lengan: jerseySpec.jenis_lengan,
      ukuran: jerseySpec.ukuran,
      qty: jerseySpec.qty,
      harga_satuan: hargaSatuan,
      harga_total: hargaSatuan * jerseySpec.qty,
      metode_ambil: jerseySpec.metode_ambil,
      alamat_pengiriman: jerseySpec.alamat_pengiriman || null,
      status_pembayaran: 'menunggu_verifikasi'
    }).eq('id', existingPo.id).select().single();
    finalPo = updatedPo as JerseyPO;
  } else {
    const poId = 'po_' + Math.random().toString(36).substring(2, 9);
    const { data: insertedPo } = await supabase.from('jersey_pos').insert({
      id: poId,
      registrant_id: reg.id,
      jenis_lengan: jerseySpec.jenis_lengan,
      ukuran: jerseySpec.ukuran,
      qty: jerseySpec.qty,
      harga_satuan: hargaSatuan,
      harga_total: hargaSatuan * jerseySpec.qty,
      status_pembayaran: 'menunggu_verifikasi',
      metode_ambil: jerseySpec.metode_ambil,
      alamat_pengiriman: jerseySpec.alamat_pengiriman || null,
      created_at: new Date().toISOString()
    }).select().single();
    finalPo = insertedPo as JerseyPO;
  }

  return { registrant: reg as Registrant, jersey_po: finalPo };
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

  const { data: updatedPo, error: updateError } = await supabase
    .from('jersey_pos')
    .update({
      bukti_transfer_url: finalUrl,
      status_pembayaran: 'menunggu_verifikasi'
    })
    .eq('registrant_id', reg.id)
    .select()
    .single();

  if (updateError || !updatedPo) return null;
  return updatedPo as JerseyPO;
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
    jersey_po: po ? (po as JerseyPO) : undefined,
    settings
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
  return data as JerseyPO;
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
  const pos = jersey_pos || [];

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

  const partisipan_jersey: any[] = [];
  regs.forEach((r: any) => {
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

  const commCounts: { [key: string]: number } = {};
  regs.forEach((r: any) => {
    const k = r.komunitas || 'Umum';
    commCounts[k] = (commCounts[k] || 0) + 1;
  });

  const top_komunitas = Object.entries(commCounts)
    .map(([nama, jumlah]) => ({ nama, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 5);

  return {
    total_peserta: regs.length,
    total_partisipan_jersey: lunasPoMap.size,
    peserta_terdaftar,
    partisipan_jersey,
    top_komunitas
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

  const posList = pos || [];
  const registrants_with_po = (regs || []).map((reg: any) => {
    const matchingPo = posList.find((p: any) => p.registrant_id === reg.id);
    return {
      registrant: reg as Registrant,
      jersey_po: matchingPo ? (matchingPo as JerseyPO) : undefined
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
