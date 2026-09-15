import { NextResponse } from 'next/server';
import { updateParticipantCheckIn } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { registrantId, isCheckedIn, checkedInBy } = await req.json();

    if (!registrantId) {
      return NextResponse.json(
        { success: false, error: 'ID Peserta (registrantId) wajib disertakan.' },
        { status: 400 }
      );
    }

    const success = await updateParticipantCheckIn(
      registrantId,
      Boolean(isCheckedIn),
      checkedInBy || 'Panitia'
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Gagal memperbarui status check-in peserta.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      registrantId,
      isCheckedIn: Boolean(isCheckedIn),
      checkedInAt: isCheckedIn ? new Date().toISOString() : null,
      checkedInBy: isCheckedIn ? (checkedInBy || 'Panitia') : null
    });
  } catch (error: any) {
    console.error('Error in check-in API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan internal pada server.' },
      { status: 500 }
    );
  }
}
