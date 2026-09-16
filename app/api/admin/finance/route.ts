import { NextResponse } from 'next/server';
import { getFinanceSummary, addExpense, updateExpense, deleteExpense } from '@/lib/db';

export const dynamic = 'force-dynamic';

function isAuthorizedFinanceUser(email?: string, role?: string, pihak?: string): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  if (role === 'superadmin' || pihak === 'superadmin') return true;
  if (cleanEmail === 'bungs@tourdegunungbatu.com') return true;
  if (cleanEmail === 'admin.tourdegunungbatu.com') return true;
  return false;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || '';
    const role = searchParams.get('role') || '';
    const pihak = searchParams.get('pihak') || '';

    if (!isAuthorizedFinanceUser(email, role, pihak)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Menu keuangan hanya untuk Superadmin dan Bungs.' },
        { status: 403 }
      );
    }

    const summary = await getFinanceSummary();
    return NextResponse.json({ success: true, ...summary });
  } catch (error: any) {
    console.error('Error GET finance:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, pihak, deskripsi, kategori, qty, harga_satuan, bukti_url, tanggal, admin_name } = body;

    if (!isAuthorizedFinanceUser(email, role, pihak)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya Superadmin dan Bungs yang berhak menambah pengeluaran.' },
        { status: 403 }
      );
    }

    if (!deskripsi || !qty || !harga_satuan) {
      return NextResponse.json(
        { success: false, error: 'Deskripsi, kuantitas (qty), dan harga satuan wajib diisi.' },
        { status: 400 }
      );
    }

    const numQty = parseInt(qty, 10) || 1;
    const numHarga = parseFloat(harga_satuan) || 0;
    const harga_total = numQty * numHarga;
    const dateStr = tanggal || new Date().toISOString().split('T')[0];

    const newExpense = await addExpense({
      deskripsi: deskripsi.trim(),
      kategori: kategori || 'operasional',
      qty: numQty,
      harga_satuan: numHarga,
      harga_total,
      bukti_url: bukti_url || '',
      tanggal: dateStr,
      created_by: admin_name || email || 'Admin Keuangan'
    });

    return NextResponse.json({
      success: true,
      message: 'Pengeluaran kas berhasil dicatat',
      expense: newExpense
    });
  } catch (error: any) {
    console.error('Error POST finance:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email, role, pihak, id, deskripsi, kategori, qty, harga_satuan, bukti_url, tanggal } = body;

    if (!isAuthorizedFinanceUser(email, role, pihak)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya Superadmin dan Bungs yang berhak mengedit pengeluaran.' },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID pengeluaran diperlukan' }, { status: 400 });
    }

    const updates: any = {};
    if (deskripsi !== undefined) updates.deskripsi = deskripsi.trim();
    if (kategori !== undefined) updates.kategori = kategori;
    if (qty !== undefined) updates.qty = parseInt(qty, 10) || 1;
    if (harga_satuan !== undefined) updates.harga_satuan = parseFloat(harga_satuan) || 0;
    if (updates.qty !== undefined && updates.harga_satuan !== undefined) {
      updates.harga_total = updates.qty * updates.harga_satuan;
    }
    if (bukti_url !== undefined) updates.bukti_url = bukti_url;
    if (tanggal !== undefined) updates.tanggal = tanggal;

    const ok = await updateExpense(id, updates);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Pengeluaran tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Data pengeluaran berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error PUT finance:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email') || '';
    const role = searchParams.get('role') || '';
    const pihak = searchParams.get('pihak') || '';

    if (!isAuthorizedFinanceUser(email, role, pihak)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya Superadmin dan Bungs yang berhak menghapus pengeluaran.' },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID pengeluaran diperlukan' }, { status: 400 });
    }

    const ok = await deleteExpense(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Pengeluaran tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Data pengeluaran berhasil dihapus' });
  } catch (error: any) {
    console.error('Error DELETE finance:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
