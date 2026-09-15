import { NextResponse } from 'next/server';
import { updateJerseyShipping } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { poId, isShipped, shippedBy, noResi } = await req.json();

    if (!poId) {
      return NextResponse.json(
        { success: false, error: 'ID Pesanan PO (poId) wajib disertakan.' },
        { status: 400 }
      );
    }

    const success = await updateJerseyShipping(
      poId,
      Boolean(isShipped),
      shippedBy || 'Panitia Logistik',
      noResi
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Gagal memperbarui status pengiriman jersey.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      poId,
      isShipped: Boolean(isShipped),
      shippedAt: isShipped ? new Date().toISOString() : null,
      shippedBy: isShipped ? (shippedBy || 'Panitia Logistik') : null,
      noResi: noResi || null
    });
  } catch (error: any) {
    console.error('Error in shipping API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan internal pada server.' },
      { status: 500 }
    );
  }
}
