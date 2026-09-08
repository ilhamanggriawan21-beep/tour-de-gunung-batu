import { NextResponse } from 'next/server';
import { getWallOfHeroesData } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getWallOfHeroesData();
    return NextResponse.json(
      { success: true, ...data },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data Wall of Heroes' }, { status: 500 });
  }
}
