import { NextResponse } from 'next/server';
import { updateRegistrantAndPO, deleteRegistrant, deleteJerseyPO } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.registrantId) {
      return NextResponse.json({ success: false, error: 'Registrant ID is required' }, { status: 400 });
    }

    const success = await updateRegistrantAndPO(body);

    if (success) {
      return NextResponse.json({ success: true, message: 'Data peserta berhasil diperbarui' });
    } else {
      return NextResponse.json({ success: false, error: 'Gagal memperbarui data peserta' }, { status: 404 });
    }
  } catch (err) {
    console.error('Error updating registrant:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const registrantId = searchParams.get('registrantId');
    const poId = searchParams.get('poId');

    if (poId) {
      const success = await deleteJerseyPO(poId);
      if (success) {
        return NextResponse.json({ success: true, message: 'Pesanan PO Jersey berhasil dihapus' });
      } else {
        return NextResponse.json({ success: false, error: 'Pesanan PO Jersey tidak ditemukan' }, { status: 404 });
      }
    }

    if (registrantId) {
      const success = await deleteRegistrant(registrantId);
      if (success) {
        return NextResponse.json({ success: true, message: 'Data peserta berhasil dihapus total' });
      } else {
        return NextResponse.json({ success: false, error: 'Data peserta tidak ditemukan' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: false, error: 'registrantId or poId parameter is required' }, { status: 400 });
  } catch (err) {
    console.error('Error deleting registrant:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
