import { NextResponse } from 'next/server';
import { getBibLookup } from '@/lib/db';

export const dynamic = 'force-dynamic';

const REQUEST_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(request: Request): boolean {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientKey = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const current = requestCounts.get(clientKey);

  if (!current || now >= current.resetAt) {
    requestCounts.set(clientKey, { count: 1, resetAt: now + REQUEST_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(req: Request) {
  try {
    if (isRateLimited(req)) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan. Silakan coba lagi sebentar.' },
        { status: 429 }
      );
    }

    const { participantNumber } = await req.json();

    if (typeof participantNumber !== 'string' || !/^\d{4}$/.test(participantNumber)) {
      return NextResponse.json(
        { success: false, error: 'Masukkan nomor peserta 4 digit.' },
        { status: 400 }
      );
    }

    const participant = await getBibLookup(Number(participantNumber));
    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Nomor peserta tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      participant: {
        nama_lengkap: participant.nama_lengkap,
        participant_number: String(participant.nomor_bib).padStart(4, '0'),
        komunitas: participant.komunitas,
        nomor_registrasi: participant.nomor_registrasi,
        jenis_registrasi: participant.jenis_registrasi,
        bib_status: 'tersedia',
        batch_produksi: participant.batch_produksi,
        status_jersey: participant.status_jersey,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memeriksa data. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
