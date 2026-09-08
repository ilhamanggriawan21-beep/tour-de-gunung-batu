import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { registerParticipant, getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const settings = await getSettings();
    const now = new Date();

    // Check deadlines
    const regDeadline = new Date(settings.tanggal_tutup_pendaftaran);
    if (now > regDeadline) {
      return NextResponse.json(
        { success: false, error: 'Pendaftaran event telah resmi ditutup (Tenggat: 25 Sept 2026).' },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (body.jenis_registrasi === 'po_jersey') {
      const poDeadline = new Date(settings.tanggal_tutup_po);
      if (now > poDeadline) {
        return NextResponse.json(
          { success: false, error: 'PO Jersey telah ditutup (Tenggat: 20 Sept 2026). Anda masih bisa mendaftar peserta.' },
          { status: 400 }
        );
      }
    }

    if (!body.nama_lengkap || !body.alamat_lengkap || !body.no_telepon) {
      return NextResponse.json(
        { success: false, error: 'Nama, Alamat, dan No. Telepon wajib diisi.' },
        { status: 400 }
      );
    }

    if (!body.consent_data || !body.consent_waiver) {
      return NextResponse.json(
        { success: false, error: 'Persetujuan data dan waiver risiko wajib dicentang.' },
        { status: 400 }
      );
    }

    const result = await registerParticipant(body);

    // Instant revalidation for all pages
    try {
      revalidatePath('/wall-of-heroes');
      revalidatePath('/');
      revalidatePath('/admin');
    } catch (e) {}

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
