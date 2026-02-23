import { NextResponse } from 'next/server';

export function middleware(request) {
  // We no longer proxy video via middleware rewrites because 
  // Next.js dev server and Vercel Edge rewrites fail to stream HTTP 206 Partial Content Range chunks correctly for huge MP4s.
  // We handle it via app/api/proxy/media/route.js now.
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
