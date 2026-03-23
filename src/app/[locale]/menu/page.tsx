import { prisma } from '@/lib/db';
import MenuClient from '@/components/menu/MenuClient';
import NotificationBarComponent from '@/components/linktree/NotificationBar';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

function serializeCategories(categories: any[]) {
  return categories.map(cat => ({
    ...cat,
    createdAt: cat.createdAt?.toISOString() ?? null,
    updatedAt: cat.updatedAt?.toISOString() ?? null,
    products: cat.products.map((p: any) => ({
      ...p,
      price: parseFloat(p.price?.toString() ?? '0'),
      comparePrice: p.comparePrice ? parseFloat(p.comparePrice.toString()) : null,
      createdAt: p.createdAt?.toISOString() ?? null,
      updatedAt: p.updatedAt?.toISOString() ?? null,
    })),
  }));
}

function serializePromos(promos: any[]) {
  return promos.map(p => ({
    ...p,
    promoPrice: parseFloat(p.promoPrice?.toString() ?? '0'),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice.toString()) : null,
    createdAt: p.createdAt?.toISOString() ?? null,
    updatedAt: p.updatedAt?.toISOString() ?? null,
    startsAt: p.startsAt?.toISOString() ?? null,
    endsAt: p.endsAt?.toISOString() ?? null,
  }));
}

function serializeReviews(reviews: any[]) {
  return reviews.map(r => ({
    ...r,
    date: r.date?.toISOString() ?? null,
    createdAt: r.createdAt?.toISOString() ?? null,
    updatedAt: r.updatedAt?.toISOString() ?? null,
  }));
}

export default async function MenuPage({ params }: Props) {
  const { locale } = await params;

  const [categoriesRes, promosRes, reviewsRes, faqsRes, notifRes, siteRes] = await Promise.allSettled([
    prisma.menuCategory.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: { where: { locale } },
        products: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          include: { translations: { where: { locale } } },
        },
      },
    }),
    prisma.promotion.findMany({
      where: { isVisible: true, showOnMenu: true },
      orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale } } },
    }),
    prisma.review.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.fAQ.findMany({
      where: { isVisible: true, showOnMenu: true },
      orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale } } },
    }),
    prisma.notificationBar.findFirst({ where: { id: 1 }, include: { translations: true } }),
    prisma.siteSettings.findFirst(),
  ]);

  const rawCategories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];
  const categories = serializeCategories(rawCategories.filter(c => c.products.length > 0));
  const promos = serializePromos(promosRes.status === 'fulfilled' ? promosRes.value : []);
  const reviews = serializeReviews(reviewsRes.status === 'fulfilled' ? reviewsRes.value : []);
  const faqs = faqsRes.status === 'fulfilled' ? faqsRes.value : [];
  const notifBar = notifRes.status === 'fulfilled' ? notifRes.value : null;
  const site = siteRes.status === 'fulfilled' ? siteRes.value : null;

  const enabledLocales: string[] = (() => {
    try { return JSON.parse(site?.enabledLocales || '["fr","en","it","es"]'); } catch { return ['fr', 'en', 'it', 'es']; }
  })();
  const allLocales = [['fr', 'FR'], ['en', 'EN'], ['it', 'IT'], ['es', 'ES']] as const;
  const visibleLocales = allLocales.filter(([code]) => enabledLocales.includes(code));

  return (
    <div className="min-h-screen bg-gray-50">
      {notifBar?.isVisible && (
        <div className="sticky top-0 z-50">
          <NotificationBarComponent bar={notifBar} locale={locale} />
        </div>
      )}
      <MenuClient
        categories={categories}
        promos={promos}
        reviews={reviews}
        faqs={faqs}
        site={site}
        locale={locale}
      />
      {visibleLocales.length > 1 && (
        <div className="fixed top-3 right-3 z-40">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
            {visibleLocales.map(([code, label]) => (
              <a
                key={code}
                href={code === 'fr' ? '/menu' : `/${code}/menu`}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${code === locale ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'}`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}