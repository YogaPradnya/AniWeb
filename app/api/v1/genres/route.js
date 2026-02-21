import { NextResponse } from 'next/server';
import { getGenres } from '@/lib/anime-helper';

export const revalidate = 86400; // Cache 24 jam sesuai docs

export async function GET() {
  try {
    const data = await getGenres();
    return NextResponse.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error('[API] Genres error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
