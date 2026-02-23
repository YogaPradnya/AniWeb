export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('URL parameter is required', { status: 400 });
  }

  try {
    const upstreamUrl = encodeURI(decodeURIComponent(targetUrl));
    const rangeHeader = request.headers.get('range');
    
    // Set headers untuk bypass anti-bot di server hulu
    const fetchHeaders = new Headers();
    fetchHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    fetchHeaders.set('Referer', 'https://animeinweb.com/');
    
    if (rangeHeader) {
      fetchHeaders.set('Range', rangeHeader);
    }

    // Proxy request ke upstream server
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: fetchHeaders,
      cache: 'no-store'
    });

    // Pindahkan header krusial untuk HTML5 video streaming (Partial Content 206)
    const responseHeaders = new Headers();
    const headersToKeep = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
    ];

    for (const [key, value] of upstreamResponse.headers) {
      if (headersToKeep.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    }
    
    // Explicitly set support for Byte Range requests to trick browser
    responseHeaders.set('Accept-Ranges', 'bytes');
    
    // Cross Origin Header for Video Player
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    // Stream the readable body directly to client with identical status code (200 or 206)
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[Proxy Error]', err.message);
    return new Response('Streaming Proxy Error', { status: 500 });
  }
}
