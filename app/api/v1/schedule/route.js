
import { NextResponse } from 'next/server';
import { getSchedule } from '@/lib/anime-helper';

export const revalidate = 3600; // Cache 1 hour

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const day = searchParams.get('day') || 'senin';

  try {
    const result = await getSchedule(day);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Schedule error:', error);
    return NextResponse.json({ 
      success: true, 
      data: { schedule: [], currentDay: day } 
    });
  }
}
