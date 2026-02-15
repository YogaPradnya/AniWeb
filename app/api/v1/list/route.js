
import { NextResponse } from 'next/server';
import { getListAnime } from '@/lib/anime-helper';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const data = await getListAnime();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] List error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
