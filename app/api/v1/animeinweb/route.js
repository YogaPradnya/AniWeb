import { NextResponse } from 'next/server';
import { getAnimeInWebInfo } from '@/lib/anime-helper';

export const revalidate = 1800; // Cache 30 menit sesuai docs

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Parameter id diperlukan' },
      { status: 400 }
    );
  }

  try {
    const data = await getAnimeInWebInfo(id);
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Data anime tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] AnimeInWeb error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
