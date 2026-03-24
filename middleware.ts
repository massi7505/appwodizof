import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Seuls ces hôtes peuvent accéder à /admin
const ALLOWED_HOSTS = ['www.woodiz15.fr', 'woodiz15.fr'];

// En développement local, on autorise aussi localhost
function isAllowedHost(host: string): boolean {
  return (
    ALLOWED_HOSTS.includes(host) ||
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1')
  );
}

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
  const host = request.headers.get('host') ?? '';

  // Hôte non autorisé (ex: appwodizof.vercel.app) → 404 + supprime le cookie
  if (!isAllowedHost(host)) {
    const res = NextResponse.rewrite(new URL('/not-found', request.url));
    res.cookies.delete('admin_token');
    return res;
  }

  const authenticated = await isAuthenticated(request);

  // /admin/login : si déjà connecté → redirige vers /admin
  if (pathname.startsWith('/admin/login')) {
    if (authenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // /admin/* : requiert d'être connecté
  if (!authenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
