import { NextResponse } from 'next/server';
import { searchAnime, searchUpstream } from '@/lib/anime-helper';

export const revalidate = 300; // Cache 5 menit sesuai docs

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const sort = searchParams.get('sort') || 'views';
  const page = parseInt(searchParams.get('page') || '0');

  try {
    // Gunakan upstream API dulu (sesuai instruksi user)
    const result = await searchUpstream(q, { genre, sort, page });
    if (result.success && result.data?.length > 0) {
      return NextResponse.json(result);
    }

    // Jika upstream kosong, gunakan legacy API
    const fallback = await searchAnime(q, { genre, sort, page });
    return NextResponse.json(fallback);
  } catch (error) {
    console.error('[API] Search error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
