import { NextResponse } from 'next/server';
import { updateAdminProfile } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { adminId, nama_pic, kontak_pic } = await req.json();

    if (!adminId || !nama_pic || !kontak_pic) {
      return NextResponse.json({ success: false, error: 'Semua field PIC wajib diisi' }, { status: 400 });
    }

    const updatedAdmin = await updateAdminProfile(adminId, nama_pic, kontak_pic);
    if (!updatedAdmin) {
      return NextResponse.json({ success: false, error: 'Profil admin tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, admin: updatedAdmin });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
