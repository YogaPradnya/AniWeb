import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        'Referer': 'https://animeinweb.com/',
      }
    });

    if (!response.ok) {
        throw new Error(`Upstream returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    let buffer;
    if (typeof response.arrayBuffer === "function") {
      buffer = await response.arrayBuffer();
    } else {
      buffer = await response.buffer();
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    // Return empty image or redirect to fallback on error
    return NextResponse.redirect(new URL('/no-image.jpg', request.url));
  }
}
