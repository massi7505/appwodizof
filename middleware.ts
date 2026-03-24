import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes — skip the login page itself
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
