// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://hireflick.com',
  'https://www.hireflick.com',
  'http://localhost:3000'
];

export function middleware(request: NextRequest) {
  // Only handle API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Type', 'application/json');
  requestHeaders.set('Accept', 'application/json');

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/api/:path*',
};