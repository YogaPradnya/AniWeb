import { NextResponse } from 'next/server';
import { getTrendingAnime, getHomeUpstream } from '@/lib/anime-helper';

export const revalidate = 3600; // Cache 1 jam sesuai docs

export async function GET() {
  try {
    // Coba ambil dari upstream home data (section 'hot')
    const homeData = await getHomeUpstream();
    if (homeData && homeData.hot) {
      return NextResponse.json({ 
        success: true, 
        data: homeData.hot, 
        total: homeData.hot.length,
        source: 'upstream'
      });
    }

    // Fallback ke legacy
    const data = await getTrendingAnime();
    return NextResponse.json({ success: true, data, total: data.length, source: 'legacy' });
  } catch (error) {
    console.error('[API] Trending error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
