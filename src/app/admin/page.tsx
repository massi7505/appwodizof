import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [categories, products, promos, reviews, faqs, buttons] = await Promise.allSettled([
    prisma.menuCategory.count(),
    prisma.menuItem.count(),
    prisma.promotion.count({ where: { isVisible: true } }),
    prisma.review.count(),
    prisma.fAQ.count(),
    prisma.linktreeButton.count({ where: { isVisible: true } }),
  ]);

  const stats = [
    {
      label: 'Catégories Menu', value: categories.status === 'fulfilled' ? categories.value : 0,
      icon: '📂', href: '/admin/menu',
      bg: '#EFF6FF', iconBg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE',
    },
    {
      label: 'Produits', value: products.status === 'fulfilled' ? products.value : 0,
      icon: '🍕', href: '/admin/menu',
      bg: '#FFFBEB', iconBg: '#FEF3C7', text: '#B45309', border: '#FDE68A',
    },
    {
      label: 'Promotions actives', value: promos.status === 'fulfilled' ? promos.value : 0,
      icon: '🎯', href: '/admin/promotions',
      bg: '#FFF1F2', iconBg: '#FFE4E6', text: '#BE123C', border: '#FECDD3',
    },
    {
      label: 'Avis Google', value: reviews.status === 'fulfilled' ? reviews.value : 0,
      icon: '⭐', href: '/admin/reviews',
      bg: '#FEFCE8', iconBg: '#FEF08A', text: '#854D0E', border: '#FDE047',
    },
    {
      label: 'FAQs', value: faqs.status === 'fulfilled' ? faqs.value : 0,
      icon: '❓', href: '/admin/faqs',
      bg: '#F5F3FF', iconBg: '#EDE9FE', text: '#6D28D9', border: '#DDD6FE',
    },
    {
      label: 'Boutons Linktree', value: buttons.status === 'fulfilled' ? buttons.value : 0,
      icon: '🔗', href: '/admin/linktree',
      bg: '#F0FDF4', iconBg: '#DCFCE7', text: '#15803D', border: '#BBF7D0',
    },
  ];

  const quickLinks = [
    { href: '/admin/linktree',   label: 'Gérer Linktree',  desc: 'Boutons, cover, profil',    icon: '🔗', accent: '#EFF6FF', accentBorder: '#BFDBFE' },
    { href: '/admin/menu',       label: 'Gérer le Menu',   desc: 'Catégories & produits',      icon: '🍕', accent: '#FFFBEB', accentBorder: '#FDE68A' },
    { href: '/admin/promotions', label: 'Promotions',      desc: 'Offres en cours',            icon: '🎯', accent: '#FFF1F2', accentBorder: '#FECDD3' },
    { href: '/admin/reviews',    label: 'Avis Clients',    desc: 'Ajouter des avis Google',    icon: '⭐', accent: '#FEFCE8', accentBorder: '#FDE047' },
    { href: '/admin/hours',      label: 'Horaires',        desc: "Horaires d'ouverture",       icon: '🕐', accent: '#F0F9FF', accentBorder: '#BAE6FD' },
    { href: '/admin/settings',   label: 'Paramètres',      desc: 'SEO, couleurs, logo',        icon: '⚙️', accent: '#F8FAFC', accentBorder: '#E2E8F0' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl">

      {/* Header */}
      <div className="mb-8 admin-fade-in">
        <h1 className="text-2xl font-black" style={{ color: 'var(--admin-text)' }}>
          Tableau de bord
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
          Bienvenue dans votre espace administration Woodiz
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
        {stats.map((stat, i) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`admin-fade-in-${i + 1} group block rounded-2xl p-4 md:p-5 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg`}
            style={{
              background: stat.bg,
              border: `1px solid ${stat.border}`,
              boxShadow: '0 1px 3px rgba(26,29,46,0.05)',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: stat.iconBg }}
              >
                {stat.icon}
              </div>
              <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity mt-1" style={{ color: stat.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-3xl font-black leading-none mb-1" style={{ color: stat.text }}>
              {stat.value}
            </p>
            <p className="text-xs font-medium" style={{ color: stat.text, opacity: 0.7 }}>
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 admin-fade-in-4">
        <h2
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--admin-text-muted)' }}
        >
          Accès rapide
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {quickLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'var(--admin-surface)',
                border: '1px solid var(--admin-border)',
                boxShadow: 'var(--admin-shadow)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = link.accentBorder;
                (e.currentTarget as HTMLElement).style.background = link.accent;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--admin-border)';
                (e.currentTarget as HTMLElement).style.background = 'var(--admin-surface)';
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: link.accent, border: `1px solid ${link.accentBorder}` }}
              >
                {link.icon}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--admin-text)' }}>
                  {link.label}
                </p>
                <p className="text-xs leading-tight mt-0.5 truncate" style={{ color: 'var(--admin-text-muted)' }}>
                  {link.desc}
                </p>
              </div>
              <svg className="w-3.5 h-3.5 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--admin-text)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Site Preview */}
      <div
        className="rounded-2xl p-4 md:p-5 admin-fade-in-5"
        style={{
          background: 'var(--admin-surface)',
          border: '1px solid var(--admin-border)',
          boxShadow: 'var(--admin-shadow)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <p className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
            Aperçu du site
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['/linktree', '/menu', '/en/linktree', '/en/menu', '/it/menu', '/es/menu'].map(path => (
            <a
              key={path}
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-mono transition-all duration-150 hover:scale-[1.04]"
              style={{
                background: 'var(--admin-surface-2)',
                border: '1px solid var(--admin-border)',
                color: 'var(--admin-text-muted)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#FFFBEB';
                (e.currentTarget as HTMLElement).style.borderColor = '#FDE68A';
                (e.currentTarget as HTMLElement).style.color = '#B45309';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--admin-surface-2)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--admin-border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--admin-text-muted)';
              }}
            >
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
