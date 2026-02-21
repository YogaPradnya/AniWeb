import { NextResponse } from 'next/server';

const UPSTREAM_BASE = 'https://animeinweb.com/api/proxy/3/2';

export async function GET(request, { params }) {
  const path = params.path?.join('/') || '';
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  
  const targetUrl = `${UPSTREAM_BASE}/${path}${queryString ? `?${queryString}` : ''}`;
  console.log(`[Upstream Proxy] Fetching: ${targetUrl}`);
  
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'Referer': 'https://animeinweb.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Upstream Proxy] Error ${res.status}: ${errorText}`);
      return NextResponse.json({ success: false, error: `Upstream error ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[Upstream Proxy] Exception:`, error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
