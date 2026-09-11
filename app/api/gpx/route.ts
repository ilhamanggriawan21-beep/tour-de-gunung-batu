import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Tanggal rilis resmi H-1: 26 September 2026 00:00:00 WIB (UTC+7)
const GPX_RELEASE_DATE = new Date('2026-09-26T00:00:00+07:00').getTime();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isTestMode = searchParams.get('test') === 'true' || searchParams.get('preview') === 'true';

    const now = Date.now();
    const isReleased = now >= GPX_RELEASE_DATE || isTestMode;

    if (!isReleased) {
      return NextResponse.json(
        {
          success: false,
          error: 'Jalur GPX masih dirahasiakan (Surprise Route). File resmi akan otomatis dibuka H-1 (26 September 2026 00:00 WIB).'
        },
        { status: 403 }
      );
    }

    const gpxPath = path.join(process.cwd(), 'data', 'gpx', 'tour_de_gunung_batu.gpx');

    if (!fs.existsSync(gpxPath)) {
      return NextResponse.json(
        { success: false, error: 'File GPX belum tersedia di server' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(gpxPath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/gpx+xml; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Tour_de_Gunung_Batu_2026.gpx"',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error serving GPX file:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengunduh file GPX' },
      { status: 500 }
    );
  }
}
