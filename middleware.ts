import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PRODUCTION_HOST = 'www.woodiz15.fr';

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
  const { pathname, hostname } = request.nextUrl;

  // Bloquer /admin depuis tout domaine autre que le domaine de production
  if (pathname.startsWith('/admin') && hostname !== PRODUCTION_HOST) {
    return NextResponse.redirect(`https://${PRODUCTION_HOST}/admin/login`);
  }

  // Protect admin routes — skip the login page itself
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
