import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Ensure the admin route exists in production by explicitly handling it
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Simply pass through for now, the page itself will handle authentication
    // This ensures the route exists in production
    return NextResponse.next();
  }

  return NextResponse.next();
}

// See https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/admin/:path*'],
};
