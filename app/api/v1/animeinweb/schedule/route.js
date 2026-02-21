import { NextResponse } from 'next/server';
import { getSchedule } from '@/lib/anime-helper';

// Alias dari /api/v1/schedule
export const revalidate = 3600; // Cache 1 jam sesuai docs

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const day = searchParams.get('day') || '';

  try {
    const data = await getSchedule(day);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] AnimeInWeb/Schedule error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
