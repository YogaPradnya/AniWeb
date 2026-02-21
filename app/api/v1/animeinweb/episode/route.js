import { NextResponse } from 'next/server';
import { getAnimeEpisode } from '@/lib/anime-helper';

export const revalidate = 3600; // Cache 1 jam sesuai docs

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const animeId = searchParams.get('animeId');
  const episodeNumber = searchParams.get('episodeNumber');

  if (!animeId || !episodeNumber) {
    return NextResponse.json(
      { success: false, error: 'Parameter animeId dan episodeNumber diperlukan' },
      { status: 400 }
    );
  }

  try {
    const data = await getAnimeEpisode(animeId, episodeNumber);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] Episode error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
