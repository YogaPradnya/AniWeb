import { NextResponse } from 'next/server';
import { getListAnime } from '@/lib/anime-helper';

export const revalidate = 1800; // Cache 30 menit sesuai docs

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');

  try {
    const result = await getListAnime(page);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] List error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
