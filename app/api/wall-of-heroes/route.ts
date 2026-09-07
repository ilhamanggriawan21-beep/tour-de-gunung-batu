import { NextResponse } from 'next/server';
import { getWallOfHeroesData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getWallOfHeroesData();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data Wall of Heroes' }, { status: 500 });
  }
}
