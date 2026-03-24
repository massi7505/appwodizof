import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Admin — Woodiz' };

async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAuthenticated();

  // Si non authentifié, le middleware gère la redirection vers /admin/login
  // Le layout rend juste les children (page login)
  if (!authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--admin-bg)' }}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
