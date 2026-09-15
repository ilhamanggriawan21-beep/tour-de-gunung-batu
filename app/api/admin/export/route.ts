import { NextResponse } from 'next/server';
import { getAllAdminData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchParam = searchParams.get('batch'); // '1', '2', 'unbatched', 'all_jersey', etc.
    const { registrants_with_po } = await getAllAdminData();

    // If batch parameter is specified for Jersey Vendor
    if (batchParam) {
      let filtered = registrants_with_po.filter(item => item.jersey_po);

      if (batchParam === 'unbatched') {
        filtered = filtered.filter(item => !item.jersey_po?.batch_produksi);
      } else if (batchParam !== 'all_jersey') {
        const batchNum = parseInt(batchParam, 10);
        filtered = filtered.filter(item => item.jersey_po?.batch_produksi === batchNum);
      }

      // Vendor CSV Format
      let csv = 'No,BIB,Nama Peserta,Komunitas,No. Telepon,Kategori,Jenis Lengan,Ukuran,Qty,Metode Ambil,Alamat Pengiriman,Status Bayar,Batch Produksi\n';

      filtered.forEach(({ registrant: r, jersey_po: p }, idx) => {
        if (!p) return;
        const no = idx + 1;
        const bib = r.nomor_bib;
        const nama = `"${r.nama_lengkap.replace(/"/g, '""')}"`;
        const kom = `"${(r.komunitas || 'Umum').replace(/"/g, '""')}"`;
        const telp = `"${r.no_telepon}"`;
        const kategori = p.kategori_ukuran === 'anak' ? 'Anak' : 'Dewasa';
        const lengan = p.jenis_lengan === 'short_sleeve' ? 'Short Sleeve (Lengan Pendek)' : 'Long Sleeve (Lengan Panjang)';
        const ukuran = p.ukuran;
        const qty = p.qty;
        const metode = p.metode_ambil === 'dikirim' ? 'Dikirim (Ekspedisi)' : 'Ambil di Lokasi (Hari H)';
        const alamatKirim = `"${(p.alamat_pengiriman || '-').replace(/"/g, '""')}"`;
        const status = p.status_pembayaran;
        const batchLabel = p.batch_produksi ? `Batch ${p.batch_produksi}` : 'Belum Masuk Batch';

        csv += `${no},${bib},${nama},${kom},${telp},${kategori},${lengan},${ukuran},${qty},${metode},${alamatKirim},${status},${batchLabel}\n`;
      });

      const filename = batchParam === 'unbatched'
        ? 'Order_Jersey_Vendor_Unbatched_TDGB.csv'
        : `Order_Jersey_Vendor_Batch_${batchParam}_TDGB.csv`;

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    // Default: Rekap Keseluruhan Peserta
    let csv = 'BIB,No. Registrasi,Nama Lengkap,Komunitas,No. Telepon,No. Kerabat,Alamat Lengkap,Jenis Registrasi,Kategori Jersey,Jenis Lengan,Ukuran,Qty,Metode Ambil,Alamat Pengiriman,Batch Produksi,Total Harga,Status Pembayaran,Verifikator,Tanggal Bayar\n';

    registrants_with_po.forEach(({ registrant: r, jersey_po: p }) => {
      const bib = r.nomor_bib;
      const noReg = r.nomor_registrasi;
      const nama = `"${r.nama_lengkap.replace(/"/g, '""')}"`;
      const kom = `"${(r.komunitas || 'Umum').replace(/"/g, '""')}"`;
      const telp = `"${r.no_telepon}"`;
      const telpKerabat = `"${r.no_telepon_kerabat || ''}"`;
      const alamat = `"${r.alamat_lengkap.replace(/"/g, '""')}"`;
      const jenisReg = r.jenis_registrasi;
      
      const kategori = p ? (p.kategori_ukuran === 'anak' ? 'Anak' : 'Dewasa') : '-';
      const lengan = p ? (p.jenis_lengan === 'short_sleeve' ? 'Short Sleeve' : 'Long Sleeve') : '-';
      const ukuran = p ? p.ukuran : '-';
      const qty = p ? p.qty : 0;
      const metode = p ? p.metode_ambil : '-';
      const alamatKirim = p ? `"${(p.alamat_pengiriman || '').replace(/"/g, '""')}"` : '-';
      const batchStr = p ? (p.batch_produksi ? `Batch ${p.batch_produksi}` : 'Belum Masuk Batch') : '-';
      const total = p ? p.harga_total : 0;
      const status = p ? p.status_pembayaran : 'tanpa_po';
      const verifikator = p ? (p.verified_by || '-') : '-';
      const tglBayar = p ? (p.paid_at || '-') : '-';

      csv += `${bib},${noReg},${nama},${kom},${telp},${telpKerabat},${alamat},${jenisReg},${kategori},${lengan},${ukuran},${qty},${metode},${alamatKirim},${batchStr},${total},${status},${verifikator},${tglBayar}\n`;
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
