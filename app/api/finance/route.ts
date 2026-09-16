import { NextResponse } from 'next/server';
import { getFinanceSummary } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = await getFinanceSummary();

    // Sanitized public output for homepage live transparency
    const publicExpenses = (summary.expenses || []).map(e => ({
      id: e.id,
      deskripsi: e.deskripsi,
      kategori: e.kategori || 'operasional',
      qty: e.qty,
      harga_satuan: e.harga_satuan,
      harga_total: e.harga_total,
      bukti_url: e.bukti_url || null,
      tanggal: e.tanggal,
      created_at: e.created_at
    }));

    return NextResponse.json({
      success: true,
      total_pemasukan_lunas: summary.total_pemasukan_lunas,
      total_qty_jersey_lunas: summary.total_qty_jersey_lunas,
      total_estimasi_pending: summary.total_estimasi_pending || 0,
      total_qty_jersey_pending: summary.total_qty_jersey_pending || 0,
      total_pengeluaran: summary.total_pengeluaran,
      saldo_kas: summary.saldo_kas,
      expenses: publicExpenses
    });
  } catch (error: any) {
    console.error('Error public finance GET:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
