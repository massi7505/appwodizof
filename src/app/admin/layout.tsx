import { getSession } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Admin — Woodiz' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Non connecté → pas de sidebar (page /admin affiche le formulaire login)
  if (!session) {
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
