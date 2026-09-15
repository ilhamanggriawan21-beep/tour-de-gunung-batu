import { NextResponse } from 'next/server';
import { updateJerseyBatch, assignUnbatchedToBatch } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'assign_unbatched') {
      const targetBatch = body.batchNumber || 2;
      const count = await assignUnbatchedToBatch(targetBatch);
      return NextResponse.json({
        success: true,
        message: `Berhasil memasukkan ${count} pesanan ke Batch ${targetBatch}`,
        count
      });
    }

    const { poId, registrantId, batchNumber } = body;
    const targetId = poId || registrantId;

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'poId atau registrantId diperlukan' }, { status: 400 });
    }

    const success = await updateJerseyBatch(targetId, batchNumber !== undefined ? batchNumber : null);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Status batch jersey berhasil diubah ${batchNumber ? `menjadi Batch ${batchNumber}` : 'menjadi Belum Masuk Batch'}`
      });
    } else {
      return NextResponse.json({ success: false, error: 'Pesanan jersey tidak ditemukan' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Batch route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
