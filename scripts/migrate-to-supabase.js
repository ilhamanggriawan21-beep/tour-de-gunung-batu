const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dqeztqscyzitvgilrypq.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZXp0cXNjeXppdHZnaWxyeXBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODc3MDc2NywiZXhwIjoyMTA0MzQ2NzY3fQ.r4SY4IuU-j1IOzRXMtzrn-T1npiggXFS-MGp6TgMuWw';

const supabase = createClient(supabaseUrl, serviceKey);

async function migrate() {
  const dbFile = path.join(__dirname, '..', 'data', 'db.json');
  if (!fs.existsSync(dbFile)) {
    console.log('No local db.json found.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  console.log('Migrating local data to Supabase...');

  // 1. Registrants
  if (data.registrants && data.registrants.length > 0) {
    for (const r of data.registrants) {
      const { error } = await supabase.from('registrants').upsert({
        id: r.id,
        nomor_registrasi: r.nomor_registrasi,
        nomor_bib: r.nomor_bib,
        nama_lengkap: r.nama_lengkap,
        alamat_lengkap: r.alamat_lengkap,
        no_telepon: r.no_telepon,
        no_telepon_kerabat: r.no_telepon_kerabat || null,
        komunitas: r.komunitas || 'Umum',
        jenis_registrasi: r.jenis_registrasi,
        consent_data: r.consent_data,
        consent_waiver: r.consent_waiver,
        consent_no_refund: r.consent_no_refund || false,
        created_at: r.created_at
      }, { onConflict: 'nomor_registrasi' });
      if (error) console.error('Error migrating registrant:', r.nama_lengkap, error);
      else console.log('✓ Registrant migrated:', r.nama_lengkap, '#' + r.nomor_bib);
    }
  }

  // 2. Jersey POs
  if (data.jersey_pos && data.jersey_pos.length > 0) {
    for (const po of data.jersey_pos) {
      const { error } = await supabase.from('jersey_pos').upsert({
        id: po.id,
        registrant_id: po.registrant_id,
        jenis_lengan: po.jenis_lengan,
        ukuran: po.ukuran,
        qty: po.qty,
        harga_satuan: po.harga_satuan,
        harga_total: po.harga_total,
        bukti_transfer_url: po.bukti_transfer_url || null,
        status_pembayaran: po.status_pembayaran,
        metode_ambil: po.metode_ambil,
        alamat_pengiriman: po.alamat_pengiriman || null,
        verified_by: po.verified_by || null,
        verified_at: po.verified_at || null,
        paid_at: po.paid_at || null,
        catatan_admin: po.catatan_admin || null
      }, { onConflict: 'id' });
      if (error) console.error('Error migrating PO:', po.id, error);
      else console.log('✓ PO migrated:', po.id);
    }
  }

  // Set sequence to max bib + 1
  const { data: maxBibData } = await supabase.from('registrants').select('nomor_bib').order('nomor_bib', { ascending: false }).limit(1);
  if (maxBibData && maxBibData.length > 0) {
    console.log('Highest BIB migrated:', maxBibData[0].nomor_bib);
  }

  console.log('🎉 Migration to Supabase completed successfully!');
}

migrate();
