import { NextResponse } from 'next/server';
import { getAdmins, createAdminUser, deleteAdminUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admins = await getAdmins();
    return NextResponse.json({ success: true, admins });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email_login, password, pihak, nama_pic, kontak_pic } = body;

    if (!email_login || !nama_pic || !pihak) {
      return NextResponse.json({ success: false, error: 'Email login, nama PIC, dan pihak wajib diisi.' }, { status: 400 });
    }

    if (pihak !== 'rudeboys' && pihak !== 'peaderal') {
      return NextResponse.json({ success: false, error: 'Pihak harus Rudeboys atau PEADERAL.' }, { status: 400 });
    }

    const admins = await getAdmins();
    const exists = admins.some(a => a.email_login.toLowerCase() === email_login.toLowerCase().trim());
    if (exists) {
      return NextResponse.json({ success: false, error: 'Email login sudah digunakan oleh akun lain.' }, { status: 400 });
    }

    const newAdmin = await createAdminUser({
      email_login,
      password: password || 'admin123',
      pihak,
      nama_pic,
      kontak_pic: kontak_pic || ''
    });

    return NextResponse.json({ success: true, admin: newAdmin });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID admin diperlukan' }, { status: 400 });
    }

    const success = await deleteAdminUser(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Gagal menghapus akun atau akun superadmin tidak dapat dihapus.' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
