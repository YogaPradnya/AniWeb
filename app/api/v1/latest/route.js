
import { NextResponse } from 'next/server';
import { getLatestAnime } from '@/lib/anime-helper';

export const revalidate = 60; // Cache for 1 min

export async function GET() {
  try {
    const data = await getLatestAnime();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] Latest error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
