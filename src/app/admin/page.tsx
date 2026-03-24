import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default async function AdminPage() {
  const session = await getSession();

  // Non connecté → formulaire de login
  if (!session) {
    return <AdminLoginForm />;
  }

  // Connecté → dashboard
  const today = new Date(new Date().toISOString().split('T')[0]);
  const [categories, products, promos, reviews, faqs, buttons, todayVisits, totalVisits] = await Promise.allSettled([
    prisma.menuCategory.count(),
    prisma.menuItem.count(),
    prisma.promotion.count({ where: { isVisible: true } }),
    prisma.review.count(),
    prisma.fAQ.count(),
    prisma.linktreeButton.count({ where: { isVisible: true } }),
    prisma.visit.count({ where: { createdAt: { gte: today } } }),
    prisma.visit.count(),
  ]);

  const stats = [
    { label: 'Visites aujourd\'hui', value: todayVisits.status === 'fulfilled' ? todayVisits.value : 0, icon: '📊', href: '/admin/visits',      cls: 'kpi-blue'   },
    { label: 'Visites totales',     value: totalVisits.status === 'fulfilled' ? totalVisits.value : 0, icon: '👁️', href: '/admin/visits',      cls: 'kpi-purple' },
    { label: 'Produits',            value: products.status    === 'fulfilled' ? products.value    : 0, icon: '🍕', href: '/admin/menu',        cls: 'kpi-amber'  },
    { label: 'Promotions actives',  value: promos.status      === 'fulfilled' ? promos.value      : 0, icon: '🎯', href: '/admin/promotions',  cls: 'kpi-red'    },
    { label: 'Avis Google',         value: reviews.status     === 'fulfilled' ? reviews.value     : 0, icon: '⭐', href: '/admin/reviews',     cls: 'kpi-yellow' },
    { label: 'Boutons Linktree',    value: buttons.status     === 'fulfilled' ? buttons.value     : 0, icon: '🔗', href: '/admin/linktree',    cls: 'kpi-green'  },
  ];

  const quickLinks = [
    { href: '/admin/visits',     label: 'Statistiques',    desc: 'Visites & trafic',          icon: '📊' },
    { href: '/admin/linktree',   label: 'Gérer Linktree',  desc: 'Boutons, cover, profil',   icon: '🔗' },
    { href: '/admin/menu',       label: 'Gérer le Menu',   desc: 'Catégories & produits',     icon: '🍕' },
    { href: '/admin/promotions', label: 'Promotions',      desc: 'Offres en cours',           icon: '🎯' },
    { href: '/admin/hours',      label: 'Horaires',        desc: "Horaires d'ouverture",      icon: '🕐' },
    { href: '/admin/settings',   label: 'Paramètres',      desc: 'SEO, couleurs, logo',       icon: '⚙️' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8 admin-fade-in">
        <h1 className="text-2xl font-black" style={{ color: 'var(--admin-text)' }}>Tableau de bord</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>Bienvenue dans votre espace administration Woodiz</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
        {stats.map((stat, i) => (
          <Link key={stat.label} href={stat.href} className={`admin-fade-in-${i + 1} admin-kpi-card group ${stat.cls}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="kpi-icon-box">{stat.icon}</div>
              <svg className="w-3.5 h-3.5 mt-1 opacity-0 group-hover:opacity-60 transition-opacity kpi-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-3xl font-black leading-none mb-1 kpi-value">{stat.value}</p>
            <p className="text-xs font-medium kpi-label">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mb-8 admin-fade-in-4">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--admin-text-muted)' }}>Accès rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href} className="admin-quick-link group">
              <div className="admin-quick-icon">{link.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--admin-text)' }}>{link.label}</p>
                <p className="text-xs leading-tight mt-0.5 truncate" style={{ color: 'var(--admin-text-muted)' }}>{link.desc}</p>
              </div>
              <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: 'var(--admin-text)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      <div className="admin-card admin-fade-in-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <p className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>Aperçu du site</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['/linktree', '/menu', '/en/linktree', '/en/menu', '/it/menu', '/es/menu'].map(path => (
            <a key={path} href={path} target="_blank" rel="noopener noreferrer" className="admin-site-chip">
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {path}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
