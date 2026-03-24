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

function isAllowedHost(request: NextRequest): boolean {
  const host = request.headers.get('host') || '';
  return (
    host === 'www.woodiz15.fr' ||
    host === 'woodiz15.fr' ||
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // Bloquer l'accès admin depuis tout domaine non autorisé (ex: *.vercel.app)
  if (!isAllowedHost(request)) {
    const res = NextResponse.redirect('https://www.woodiz15.fr/admin/login');
    // Effacer le cookie de session pour éviter tout contournement
    res.cookies.delete('admin_token');
    return res;
  }

  // Sur le bon domaine : protéger les routes admin sauf /admin/login
  if (!pathname.startsWith('/admin/login')) {
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
