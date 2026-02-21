
import { NextResponse } from 'next/server';
import { getTrendingAnime } from '@/lib/anime-helper';

export const revalidate = 300; // Cache for 5 min

export async function GET() {
  try {
    const data = await getTrendingAnime();
    return NextResponse.json({ 
      success: true, 
      data,
      total: data.length
    });
  } catch (error) {
    console.error('[API] Trending error:', error);
    return NextResponse.json({ 
      success: true, 
      data: [],
      total: 0
    });
  }
}
