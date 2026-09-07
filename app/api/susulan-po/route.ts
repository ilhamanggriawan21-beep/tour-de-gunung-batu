import { NextResponse } from 'next/server';
import { addLateJerseyPO, getSettings } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const settings = await getSettings();
    const now = new Date();
    const poDeadline = new Date(settings.tanggal_tutup_po);

    if (now > poDeadline) {
      return NextResponse.json(
        { success: false, error: 'PO Jersey telah ditutup untuk keperluan produksi pada 20 September 2026.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { registrantIdOrNo, jerseySpec } = body;

    if (!registrantIdOrNo || !jerseySpec) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
    }

    const result = await addLateJerseyPO(registrantIdOrNo, jerseySpec);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Nomor Registrasi atau Nomor Telepon tidak ditemukan. Silakan daftar peserta terlebih dahulu.' },
        { status: 444 }
      );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}
