import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing target URL', { status: 400 });
  }

  const range = request.headers.get('range');
  const headers = {
    'Referer': 'https://animeinweb.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  // KUNCI PROGRESSIVE STREAMING 2MB:
  if (range) {
    headers['Range'] = range;
  }

  try {
    const res = await fetch(targetUrl, { 
      headers,
      cache: 'no-store'
    });

    if (!res.ok && res.status !== 206) {
      console.error(`[Media Proxy] Upstream returned ${res.status} for ${targetUrl}`);
    }

    // Proxy 100% Transparan: Teruskan semua header dari server asli ke browser
    // Ini PENTING agar browser mendeteksi "Content-Length" dan "Accept-Ranges" dengan akurat
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      // Abaikan kompresi agar browser tidak bingung
      if (key.toLowerCase() !== 'content-encoding') {
        responseHeaders.set(key, value);
      }
    });

    // Paksakan dukungan 'seek/lompat' ke browser
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    
    // Jangan ubah status HTTP sama sekali (terutama 206 Partial Content)
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error(`[Media Proxy] Error fetching ${targetUrl}:`, err.message);
    return new Response(`Proxy Error: ${err.message}`, { status: 500 });
  }
}
