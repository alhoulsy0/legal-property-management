import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.has('auth_token');
  const path = request.nextUrl.pathname;
  
  if (path === '/') {
    return NextResponse.next();
  }
  
  if (!isLoggedIn && !path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isLoggedIn && path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
