import { NextResponse } from 'next/server';
import { getNewAnime, getHomeUpstream } from '@/lib/anime-helper';

export const revalidate = 3600; // Cache 1 jam sesuai docs

export async function GET() {
  try {
    // Coba ambil dari upstream home data (section 'new')
    const homeData = await getHomeUpstream();
    if (homeData && homeData.new) {
      return NextResponse.json({ 
        success: true, 
        data: homeData.new, 
        total: homeData.new.length,
        source: 'upstream'
      });
    }

    // Fallback ke legacy
    const data = await getNewAnime();
    return NextResponse.json({ success: true, data, total: data.length, source: 'legacy' });
  } catch (error) {
    console.error('[API] New error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
