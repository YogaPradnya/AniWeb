
import { NextResponse } from 'next/server';
import { getAnimeDetail } from '@/lib/anime-helper';

export const revalidate = 3600; // Cache 1 hour

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || searchParams.get('id');

  if (!slug) {
    return NextResponse.json({ success: false, error: 'Slug/ID missing' }, { status: 400 });
  }

  try {
    const result = await getAnimeDetail(slug);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Detail error:', error);
    return NextResponse.json({ success: false, error: 'Detail not found' }, { status: 404 });
  }
}
