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

  const authenticated = await isAuthenticated(request);

  // /admin/login : accessible si non connecté, redirige vers /admin si déjà connecté
  if (pathname.startsWith('/admin/login')) {
    if (authenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Toutes les autres routes /admin : requiert d'être connecté
  if (!authenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
