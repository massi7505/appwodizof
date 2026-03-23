import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import MenuClient from '@/components/menu/MenuClient';
import NotificationBarComponent from '@/components/linktree/NotificationBar';
import VisitTracker from '@/components/VisitTracker';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

function pickBestTranslation(translations: any[], locale: string) {
  const priority = (loc: string) => loc === locale ? 0 : loc === 'fr' ? 1 : loc === 'en' ? 2 : loc === 'it' ? 3 : loc === 'es' ? 4 : 5;
  return [...translations].sort((a, b) => priority(a.locale) - priority(b.locale));
}

function serializeCategories(categories: any[], locale: string) {
  return categories.map(cat => ({
    ...cat,
    createdAt: cat.createdAt?.toISOString() ?? null,
    updatedAt: cat.updatedAt?.toISOString() ?? null,
    translations: pickBestTranslation(cat.translations || [], locale),
    products: cat.products.map((p: any) => ({
      ...p,
      price: parseFloat(p.price?.toString() ?? '0'),
      comparePrice: p.comparePrice ? parseFloat(p.comparePrice.toString()) : null,
      createdAt: p.createdAt?.toISOString() ?? null,
      updatedAt: p.updatedAt?.toISOString() ?? null,
      translations: pickBestTranslation(p.translations || [], locale),
    })),
  }));
}

function serializePromos(promos: any[]) {
  return promos.map(p => ({
    ...p,
    promoPrice: p.promoPrice ? parseFloat(p.promoPrice.toString()) : null,
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

function serializeSite(site: any) {
  if (!site) return null;
  return {
    ...site,
    createdAt: site.createdAt?.toISOString() ?? null,
    updatedAt: site.updatedAt?.toISOString() ?? null,
  };
}

export default async function MenuPage({ params }: Props) {
  const { locale } = await params;

  const [categoriesRes, promosRes, reviewsRes, faqsRes, notifRes, siteRes] = await Promise.allSettled([
    prisma.menuCategory.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: true,
        products: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          include: { translations: true },
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
  const categories = serializeCategories(rawCategories.filter(c => c.products.length > 0), locale);
  const promos = serializePromos(promosRes.status === 'fulfilled' ? promosRes.value : []);
  const reviews = serializeReviews(reviewsRes.status === 'fulfilled' ? reviewsRes.value : []);
  const faqs = faqsRes.status === 'fulfilled' ? faqsRes.value : [];
  const notifBar = notifRes.status === 'fulfilled' ? notifRes.value : null;
  const site = serializeSite(siteRes.status === 'fulfilled' ? siteRes.value : null);

  // Hero data — fetched separately with per-call fallbacks
  let heroData: { settings: any; slides: any[]; featureCards: any[] } | null = null;
  try {
    const p = prisma as any;
    const DEFAULT_SETTINGS = { isVisible: true, autoplay: true, autoplayDelay: 5000, showDots: true, showArrows: true, showFeatureCards: true, accentColor: '#F59E0B' };
    const [heroSettings, heroSlides, heroCards] = await Promise.all([
      p.heroSettings?.findFirst?.().catch(() => null) ?? null,
      p.heroSlide?.findMany?.({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' }, include: { buttons: { orderBy: { sortOrder: 'asc' } } } }).catch(() => []) ?? [],
      p.heroFeatureCard?.findMany?.({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }).catch(() => []) ?? [],
    ]);
    heroData = {
      settings: heroSettings ?? DEFAULT_SETTINGS,
      slides: heroSlides ?? [],
      featureCards: heroCards ?? [],
    };
  } catch (e) {
    console.error('[hero fetch error]', e);
  }

  const enabledLocales: string[] = (() => {
    try { return JSON.parse(site?.enabledLocales || '["fr","en","it","es"]'); } catch { return ['fr', 'en', 'it', 'es']; }
  })();

  // Redirect to FR if this locale is disabled
  if (!enabledLocales.includes(locale)) redirect('/menu');

  const allLocales = [['fr', 'FR'], ['en', 'EN'], ['it', 'IT'], ['es', 'ES']] as const;
  const visibleLocales = allLocales.filter(([code]) => enabledLocales.includes(code));

  return (
    <div className="min-h-screen bg-gray-50">
      <VisitTracker page="menu" />
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
        heroData={heroData as any}
      />
    </div>
  );
}