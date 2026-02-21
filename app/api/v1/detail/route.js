import { NextResponse } from 'next/server';
import { getAnimeDetail, getMovieDetailUpstream, getEpisodeListUpstream } from '@/lib/anime-helper';

export const revalidate = 1800; // Cache 30 menit sesuai docs

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || searchParams.get('id');
  const urlParams = searchParams.get('url');

  if (!slug && !urlParams) {
    return NextResponse.json({ success: false, error: 'Parameter slug atau url diperlukan' }, { status: 400 });
  }

  const identifier = slug || urlParams;

  try {
    // Jika identifier adalah numerik (kemungkinan ID), coba ambil dari upstream movie detail
    if (/^\d+$/.test(identifier)) {
      try {
        const [movieDetail, episodeList] = await Promise.all([
          getMovieDetailUpstream(identifier),
          getEpisodeListUpstream(identifier)
        ]);
        
        if (movieDetail) {
          // Map upstream detail ke format yang diharapkan frontend
          const normalizedData = {
            animeId: identifier,
            title: movieDetail.title,
            alternativeTitle: movieDetail.alternativeTitle,
            synopsis: movieDetail.synopsis,
            status: movieDetail.status,
            type: movieDetail.type,
            genres: movieDetail.genres?.map(g => g.name || g) || [],
            poster: movieDetail.poster || movieDetail.image,
            thumbnail: movieDetail.thumbnail || movieDetail.image,
            cover: movieDetail.cover,
            views: movieDetail.views,
            score: movieDetail.score,
            episodes: episodeList || []
          };
          return NextResponse.json({ success: true, data: normalizedData, source: 'upstream' });
        }
      } catch (err) {
        console.warn(`[API] Upstream detail failed for ID ${identifier}, falling back:`, err.message);
      }
    }

    // Fallback ke legacy
    const data = await getAnimeDetail(identifier);
    return NextResponse.json({ success: true, data, source: 'legacy' });
  } catch (error) {
    console.error('[API] Detail error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
