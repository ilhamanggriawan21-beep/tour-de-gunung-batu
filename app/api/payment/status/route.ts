import { NextResponse } from 'next/server';
import { getRegistrationDetails } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const regCode = searchParams.get('code');

    if (!regCode) {
      return NextResponse.json({ success: false, error: 'Kode registrasi atau nomor telp diperlukan' }, { status: 400 });
    }

    const details = await getRegistrationDetails(regCode);
    if (!details) {
      return NextResponse.json({ success: false, error: 'Data registrasi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...details });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
