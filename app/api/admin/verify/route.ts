import { NextResponse } from 'next/server';
import { updatePaymentStatus } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { poId, status, adminId, catatanAdmin } = await req.json();

    if (!poId || !status) {
      return NextResponse.json({ success: false, error: 'poId dan status diperlukan' }, { status: 400 });
    }

    const updated = updatePaymentStatus(poId, status, adminId || 'Admin', catatanAdmin || '');

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Data PO tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, jersey_po: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
