
import { NextResponse } from 'next/server';
import { getLatestAnime } from '@/lib/anime-helper';

// Alias for /latest
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getLatestAnime();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] New error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
