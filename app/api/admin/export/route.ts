import { NextResponse } from 'next/server';
import { getAllAdminData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { registrants_with_po } = await getAllAdminData();

    // CSV Header
    let csv = 'BIB,No. Registrasi,Nama Lengkap,Komunitas,No. Telepon,No. Kerabat,Alamat Lengkap,Jenis Registrasi,Jenis Lengan,Ukuran,Qty,Metode Ambil,Alamat Pengiriman,Total Harga,Status Pembayaran,Verifikator,Tanggal Bayar\n';

    registrants_with_po.forEach(({ registrant: r, jersey_po: p }) => {
      const bib = r.nomor_bib;
      const noReg = r.nomor_registrasi;
      const nama = `"${r.nama_lengkap.replace(/"/g, '""')}"`;
      const kom = `"${(r.komunitas || 'Umum').replace(/"/g, '""')}"`;
      const telp = `"${r.no_telepon}"`;
      const telpKerabat = `"${r.no_telepon_kerabat || ''}"`;
      const alamat = `"${r.alamat_lengkap.replace(/"/g, '""')}"`;
      const jenisReg = r.jenis_registrasi;
      
      const lengan = p ? (p.jenis_lengan === 'short_sleeve' ? 'Short Sleeve' : 'Long Sleeve') : '-';
      const ukuran = p ? p.ukuran : '-';
      const qty = p ? p.qty : 0;
      const metode = p ? p.metode_ambil : '-';
      const alamatKirim = p ? `"${(p.alamat_pengiriman || '').replace(/"/g, '""')}"` : '-';
      const total = p ? p.harga_total : 0;
      const status = p ? p.status_pembayaran : 'tanpa_po';
      const verifikator = p ? (p.verified_by || '-') : '-';
      const tglBayar = p ? (p.paid_at || '-') : '-';

      csv += `${bib},${noReg},${nama},${kom},${telp},${telpKerabat},${alamat},${jenisReg},${lengan},${ukuran},${qty},${metode},${alamatKirim},${total},${status},${verifikator},${tglBayar}\n`;
    });

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Rekap_TourDeGunungBatu_2026.csv"'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
