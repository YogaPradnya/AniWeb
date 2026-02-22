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
    // 1. Jika browser sudah meminta bagian spesifik (contoh: bagian belakang video untuk mencari file Moov/Metadata),
    // kita HARUS membiarkannya. Jangan diganggu agar video bisa diputar instan tanpa buffering.
    headers['Range'] = range;
  } else {
    // 2. Jika browser baru PERTAMA KALI meload (tidak mengirim Range), kita paksa server 
    // hanya mengirimkan 2 MB data awal. Ini memaksa server menjawab dengan "206 Partial Content", 
    // yang akhirnya membuat browser PAHAM bahwa video ini bisa di "Skip/Seek" dan aman diputar sebagian.
    const isVideo = targetUrl.includes('.mp4') || targetUrl.includes('storages.animein');
    if (isVideo) {
      headers['Range'] = 'bytes=0-2097152'; // Pancingan 2 MB
    }
  }

  try {
    // We use a longer timeout for video streams
    const res = await fetch(targetUrl, { 
      headers,
      cache: 'no-store'
    });

    if (!res.ok && res.status !== 206) {
      console.error(`[Media Proxy] Upstream returned ${res.status} for ${targetUrl}`);
    }

    // Forward relevant headers
    const responseHeaders = new Headers();
    const forwardHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'content-disposition'
    ];

    forwardHeaders.forEach(h => {
      const value = res.headers.get(h);
      if (value) responseHeaders.set(h, value);
    });

    // Strategy: Cache small segments (like .ts) but not the whole video stream if it's a main file
    // However, for proxying anime streams, a short public cache helps with stability.
    if (res.status === 200) {
      responseHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    } else {
      responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    // Add CORS for the proxy itself
    responseHeaders.set('Access-Control-Allow-Origin', '*');

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
