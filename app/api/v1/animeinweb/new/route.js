import { NextResponse } from 'next/server';
import { getNewAnime } from '@/lib/anime-helper';

// Alias dari /api/v1/new
export const revalidate = 3600; // Cache 1 jam sesuai docs

export async function GET() {
  try {
    const data = await getNewAnime();
    return NextResponse.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error('[API] AnimeInWeb/New error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
