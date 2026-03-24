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

  // /admin/login et anciennes URL → redirige vers /admin (qui gère login + dashboard)
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Toutes les sous-routes /admin/* (menu, promotions, etc.) → requiert auth
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protège les sous-routes uniquement — /admin lui-même gère son propre état
  matcher: ['/admin/login', '/admin/:path+'],
};
