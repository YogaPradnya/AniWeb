
import { NextResponse } from 'next/server';
import { searchAnime } from '@/lib/anime-helper';

export const revalidate = 0; // Disable cache

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('q') || searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json({ success: false, error: 'Meta keywords missing' }, { status: 400 });
  }

  try {
    const data = await searchAnime(keyword);
    return NextResponse.json({ 
      success: true, 
      data,
      total: data.length
    });
  } catch (error) {
    console.error('[API] Search error:', error);
    // Return empty array instead of 500 to prevent frontend crash
    return NextResponse.json({ 
      success: true, 
      data: [],
      total: 0
    });
  }
}
