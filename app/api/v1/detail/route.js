import { NextResponse } from 'next/server';
import { getAnimeDetail } from '@/lib/anime-helper';

export const revalidate = 1800; // Cache 30 menit sesuai docs

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || searchParams.get('id');
  const url = searchParams.get('url');

  if (!slug && !url) {
    return NextResponse.json({ success: false, error: 'Parameter slug atau url diperlukan' }, { status: 400 });
  }

  try {
    const identifier = slug || url;
    const data = await getAnimeDetail(identifier);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] Detail error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
