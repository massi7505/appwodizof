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
    { label: 'Catégories Menu', value: categories.status === 'fulfilled' ? categories.value : 0, icon: '📂', href: '/admin/menu', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { label: 'Produits', value: products.status === 'fulfilled' ? products.value : 0, icon: '🍕', href: '/admin/menu', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { label: 'Promotions actives', value: promos.status === 'fulfilled' ? promos.value : 0, icon: '🎯', href: '/admin/promotions', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { label: 'Avis Google', value: reviews.status === 'fulfilled' ? reviews.value : 0, icon: '⭐', href: '/admin/reviews', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { label: 'FAQs', value: faqs.status === 'fulfilled' ? faqs.value : 0, icon: '❓', href: '/admin/faqs', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { label: 'Boutons Linktree', value: buttons.status === 'fulfilled' ? buttons.value : 0, icon: '🔗', href: '/admin/linktree', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  ];

  const quickLinks = [
    { href: '/admin/linktree', label: 'Gérer Linktree', desc: 'Boutons, cover, profil', icon: '🔗' },
    { href: '/admin/menu', label: 'Gérer le Menu', desc: 'Catégories & produits', icon: '🍕' },
    { href: '/admin/promotions', label: 'Promotions', desc: 'Offres en cours', icon: '🎯' },
    { href: '/admin/reviews', label: 'Avis Clients', desc: 'Ajouter des avis Google', icon: '⭐' },
    { href: '/admin/hours', label: 'Horaires', desc: "Horaires d'ouverture", icon: '🕐' },
    { href: '/admin/settings', label: 'Paramètres', desc: 'SEO, couleurs, logo', icon: '⚙️' },
  ];

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenue dans votre espace administration Woodiz</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className={"admin-card border hover:scale-[1.02] transition-transform " + stat.color}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="text-xs font-medium opacity-80">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Accès rapide</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {quickLinks.map(link => (
          <Link key={link.href} href={link.href} className="admin-card hover:border-amber-500/40 transition-all group">
            <div className="flex items-center gap-3">
              <span className="text-xl">{link.icon}</span>
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">{link.label}</p>
                <p className="text-xs text-gray-500">{link.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
        <p className="text-sm font-semibold text-white mb-3">Aperçu du site</p>
        <div className="flex flex-wrap gap-2">
          {['/linktree', '/menu', '/en/linktree', '/en/menu', '/it/menu', '/es/menu'].map(path => (
            <a key={path} href={path} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors font-mono">
              {path}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
