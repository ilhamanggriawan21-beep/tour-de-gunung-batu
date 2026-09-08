import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { updatePaymentStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { poId, status, adminId, catatanAdmin } = await req.json();

    if (!poId || !status) {
      return NextResponse.json({ success: false, error: 'poId dan status diperlukan' }, { status: 400 });
    }

    const updated = await updatePaymentStatus(poId, status, adminId || 'Admin', catatanAdmin || '');

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Data PO tidak ditemukan' }, { status: 404 });
    }

    // Instant revalidation for Wall of Heroes and Admin
    try {
      revalidatePath('/wall-of-heroes');
      revalidatePath('/');
      revalidatePath('/admin');
    } catch (e) {}

    return NextResponse.json({ success: true, jersey_po: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
