import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;

  if (url.pathname === '/api/proxy/media' || url.pathname === '/api/proxy/media/') {
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new NextResponse('Missing url parameter', { status: 400 });
    }

    try {
      const parsedTarget = new URL(targetUrl);
      
      // Prepare headers for the request to the upstream server
      const requestHeaders = new Headers(request.headers);
      
      // Override referer and user-agent to bypass upstream restrictions
      requestHeaders.set('referer', 'https://animeinweb.com/');
      requestHeaders.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Remove headers that might cause the upstream to reject the proxy request
      requestHeaders.delete('origin');
      requestHeaders.delete('host');
      
      // Rewrite uses Vercel's edge network inverse proxy, which correctly streams video, 
      // preserves Content-Length, HTTP 206 Partial Content, and Range requests,
      // avoiding the Next.js fetch() stream buffering issue.
      return NextResponse.rewrite(parsedTarget, {
        request: {
          headers: requestHeaders,
        },
      });
    } catch (e) {
      return new NextResponse('Invalid URL format', { status: 400 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/proxy/media', '/api/proxy/media/'],
};
