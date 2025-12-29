import { NextResponse } from "next/server";

// Disable caching untuk proxy route - selalu ambil data fresh dari API
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { path } = params;
  const { searchParams } = new URL(request.url);
  
  // HANYA ambil dari environment variable, TIDAK ada fallback hardcoded
  const apiBase = process.env.API_BASE_URL;
  
  if (!apiBase) {
    console.error('[Proxy] API_BASE_URL environment variable is not set');
    return NextResponse.json(
      { success: false, error: 'API configuration error' },
      { status: 500 }
    );
  }
  
  const pathStr = path.join("/");
  
  // Filter out cache-busting parameter (_t) sebelum kirim ke API asli
  const cleanParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== '_t') {
      cleanParams.append(key, value);
    }
  });
  
  const queryStr = cleanParams.toString();
  const endpoint = `/${pathStr}${queryStr ? `?${queryStr}` : ''}`;
  const fullUrl = `${apiBase}${endpoint}`;
  
  console.log(`[Proxy] Fetching: ${endpoint}`);
  if (endpoint.includes('schedule')) {
    const dayParam = cleanParams.get('day') || 'NOT PROVIDED';
    console.log(`[Proxy] Schedule request - day parameter: "${dayParam}"`);
  }
  
  try {
    // PASTIKAN tidak ada caching di fetch - selalu ambil data fresh
    const response = await fetch(fullUrl, {
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      cache: 'no-store', // Disable Next.js fetch caching
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `API returned ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Log untuk debugging schedule
    if (endpoint.includes('schedule') && data.success && data.data) {
      console.log(`[Proxy] Schedule response - currentDay: ${data.data.currentDay || 'N/A'}, count: ${data.data.schedule?.length || 0}`);
    }
    
    // Set response headers untuk disable caching di client
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    // Jangan expose URL asli di error message
    console.error(`[Proxy] Error fetching endpoint: ${endpoint}`);
    return NextResponse.json(
      { success: false, error: `Proxy Error: ${error.message}` },
      { status: 500 }
    );
  }
}



