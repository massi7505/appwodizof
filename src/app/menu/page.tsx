import { prisma } from '@/lib/db';
import MenuClient from '@/components/menu/MenuClient';
import NotificationBarComponent from '@/components/linktree/NotificationBar';

const LOCALE = 'fr';

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

export default async function MenuPageFR() {
  const [categoriesRes, promosRes, reviewsRes, faqsRes, notifRes, siteRes] = await Promise.allSettled([
    prisma.menuCategory.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: { where: { locale: LOCALE } },
        products: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          include: { translations: { where: { locale: LOCALE } } },
        },
      },
    }),
    prisma.promotion.findMany({
      where: { isVisible: true, showOnMenu: true },
      orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale: LOCALE } } },
    }),
    prisma.review.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.fAQ.findMany({
      where: { isVisible: true, showOnMenu: true },
      orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale: LOCALE } } },
    }),
    prisma.notificationBar.findFirst({ where: { id: 1 }, include: { translations: { where: { locale: LOCALE } } } }),
    prisma.siteSettings.findFirst(),
  ]);

  const rawCategories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];
  const categories = serializeCategories(rawCategories.filter((c: any) => c.products.length > 0));
  const promos = serializePromos(promosRes.status === 'fulfilled' ? promosRes.value : []);
  const reviews = serializeReviews(reviewsRes.status === 'fulfilled' ? reviewsRes.value : []);
  const faqs = faqsRes.status === 'fulfilled' ? faqsRes.value : [];
  const notifBar = notifRes.status === 'fulfilled' ? notifRes.value : null;
  const site = siteRes.status === 'fulfilled' ? siteRes.value : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {notifBar?.isVisible && (
        <div className="sticky top-0 z-50">
          <NotificationBarComponent bar={notifBar} locale={LOCALE} />
        </div>
      )}
      <MenuClient
        categories={categories}
        promos={promos}
        reviews={reviews}
        faqs={faqs}
        site={site}
        locale={LOCALE}
      />
    </div>
  );
}
