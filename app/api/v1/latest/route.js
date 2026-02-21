import { NextResponse } from 'next/server';
import { getLatestAnime } from '@/lib/anime-helper';

export const revalidate = 600; // Cache 10 menit sesuai docs

export async function GET() {
  try {
    const data = await getLatestAnime();
    return NextResponse.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error('[API] Latest error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
