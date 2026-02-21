import { NextResponse } from 'next/server';
import { getAnimeEpisode, getStreamUpstreamByEpId } from '@/lib/anime-helper';

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
    
    // Jika ada episodeId, coba ambil stream detail langsung dari upstream
    if (data && data.episodeId) {
       try {
         const upstreamData = await getStreamUpstreamByEpId(data.episodeId);
         if (upstreamData && upstreamData.server) {
           const upstreamSources = upstreamData.server.map(s => ({
             url: s.link,
             quality: s.quality,
             resolution: s.quality,
             name: s.name,
             server: s.name,
             type: s.type === 'direct' ? 'video/mp4' : 'iframe'
           }));
           
           // Gabungkan sumber (prioritaskan upstream)
           const existingUrls = new Set(data.videoSources?.map(v => v.url) || []);
           const freshSources = upstreamSources.filter(us => !existingUrls.has(us.url));
           data.videoSources = [...(data.videoSources || []), ...freshSources];
         }
       } catch (err) {
         console.warn('[API] Failed to fetch upstream stream info:', err.message);
       }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] Episode error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
