import { NextResponse } from 'next/server';
import { getTodayAnime } from '@/lib/anime-helper';

export const revalidate = 3600; // Cache 1 jam sesuai docs

export async function GET() {
  try {
    const data = await getTodayAnime();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] Today error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
