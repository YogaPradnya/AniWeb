import { NextResponse } from 'next/server';
import { getSchedule, getScheduleUpstream } from '@/lib/anime-helper';

export const revalidate = 3600; // Cache 1 jam sesuai docs

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const day = searchParams.get('day') || 'SENIN';

  try {
    // Coba ambil dari upstream schedule data
    const upstreamData = await getScheduleUpstream(day);
    if (upstreamData) {
      return NextResponse.json({ 
        success: true, 
        data: {
          currentDay: day.toUpperCase(),
          schedule: upstreamData
        },
        source: 'upstream'
      });
    }

    // Fallback ke legacy
    const data = await getSchedule(day);
    return NextResponse.json({ success: true, data, source: 'legacy' });
  } catch (error) {
    console.error('[API] Schedule error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
