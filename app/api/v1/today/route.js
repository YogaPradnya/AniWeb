import { NextResponse } from 'next/server';
import { getTodayAnime, getHomeUpstream } from '@/lib/anime-helper';

export const revalidate = 3600; // Cache 1 jam sesuai docs

export async function GET() {
  try {
    // Coba ambil dari upstream home data (section 'today')
    const homeData = await getHomeUpstream();
    if (homeData && homeData.today) {
      return NextResponse.json({ 
        success: true, 
        data: homeData.today,
        source: 'upstream'
      });
    }

    // Fallback ke legacy
    const data = await getTodayAnime();
    return NextResponse.json({ success: true, data, source: 'legacy' });
  } catch (error) {
    console.error('[API] Today error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
