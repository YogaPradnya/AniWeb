import { NextResponse } from "next/server";

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
  const queryStr = searchParams.toString();
  const endpoint = `/${pathStr}${queryStr ? `?${queryStr}` : ''}`;
  const fullUrl = `${apiBase}${endpoint}`;
  
  try {
    const response = await fetch(fullUrl, {
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `API returned ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Jangan expose URL asli di error message
    console.error(`[Proxy] Error fetching endpoint: ${endpoint}`);
    return NextResponse.json(
      { success: false, error: `Proxy Error: ${error.message}` },
      { status: 500 }
    );
  }
}



