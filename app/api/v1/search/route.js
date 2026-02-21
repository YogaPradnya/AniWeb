import { NextResponse } from 'next/server';
import { searchAnime } from '@/lib/anime-helper';

export const revalidate = 300; // Cache 5 menit sesuai docs

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const sort = searchParams.get('sort') || 'views';
  const page = parseInt(searchParams.get('page') || '0');

  try {
    const result = await searchAnime(q, { genre, sort, page });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Search error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
