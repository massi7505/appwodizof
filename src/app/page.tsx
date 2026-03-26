import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import MenuClient from '@/components/menu/MenuClient';
import VisitTracker from '@/components/VisitTracker';

export const revalidate = 30;

const LOCALE = 'fr';

function pickBestTranslation(translations: any[], locale: string) {
  const priority = (loc: string) => loc === locale ? 0 : loc === 'fr' ? 1 : loc === 'en' ? 2 : loc === 'it' ? 3 : loc === 'es' ? 4 : 5;
  const seen = new Set<string>();
  const uniq = translations.filter(t => { if (seen.has(t.locale)) return false; seen.add(t.locale); return true; });
  return uniq.sort((a, b) => priority(a.locale) - priority(b.locale));
}

function serializeCategories(categories: any[]) {
  return categories.map(cat => {
    const seenIds = new Set<number>();
    const uniqueProducts = (cat.products as any[]).filter(p => {
      if (seenIds.has(p.id)) return false;
      seenIds.add(p.id);
      return true;
    });
    return {
      ...cat,
      createdAt: cat.createdAt?.toISOString() ?? null,
      updatedAt: cat.updatedAt?.toISOString() ?? null,
      translations: pickBestTranslation(cat.translations || [], LOCALE),
      products: uniqueProducts.map((p: any) => ({
        ...p,
        price: parseFloat(p.price?.toString() ?? '0'),
        comparePrice: p.comparePrice ? parseFloat(p.comparePrice.toString()) : null,
        createdAt: p.createdAt?.toISOString() ?? null,
        updatedAt: p.updatedAt?.toISOString() ?? null,
        translations: pickBestTranslation(p.translations || [], LOCALE),
      })),
    };
  });
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

export default async function RootPage() {
  // Check home page setting
  let homePage = 'linktree';
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (settings?.homePage) homePage = settings.homePage;
  } catch {}

  // If not menu, redirect to the configured page
  if (homePage !== 'menu') {
    redirect('/linktree');
  }

  // Render menu directly at / for SEO (no redirect)
  const [categoriesRes, promosRes, reviewsRes, faqsRes, notifRes, siteRes] = await Promise.allSettled([
    prisma.menuCategory.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: { where: { locale: { in: [...new Set([LOCALE, 'fr'])] } } },
        products: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          include: { translations: { where: { locale: { in: [...new Set([LOCALE, 'fr'])] } } } },
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
    prisma.notificationBar.findFirst({ where: { id: 1 }, include: { translations: true } }),
    prisma.siteSettings.findFirst(),
  ]);

  const rawCategories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];
  const categories = serializeCategories(rawCategories.filter((c: any) => c.products.length > 0));
  const promos = serializePromos(promosRes.status === 'fulfilled' ? promosRes.value : []);
  const reviews = serializeReviews(reviewsRes.status === 'fulfilled' ? reviewsRes.value : []);
  const faqs = faqsRes.status === 'fulfilled' ? faqsRes.value : [];
  const notifBar = notifRes.status === 'fulfilled' ? notifRes.value : null;
  const site = serializeSite(siteRes.status === 'fulfilled' ? siteRes.value : null);

  const faqSchemaItems = (faqs as any[]).filter(f => f.translations?.[0]).map(f => ({
    '@type': 'Question',
    name: f.translations[0].question,
    acceptedAnswer: { '@type': 'Answer', text: f.translations[0].answer },
  }));

  const p = prisma as any;
  const [bannersRaw, openingHoursRaw, orderLinksRaw] = await Promise.all([
    p.notificationBanner?.findMany?.({
      where: { isVisible: true },
      orderBy: [{ priority: 'desc' }, { sortOrder: 'asc' }],
      include: { translations: true },
    }).catch(() => []) ?? [],
    prisma.openingHours.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
    prisma.linktreeButton.findMany({ where: { isVisible: true, section: { in: ['commander', 'contact'] } }, orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ]);
  const banners = bannersRaw ?? [];
  const openingHours = openingHoursRaw ?? [];
  const orderLinks = (orderLinksRaw ?? [])
    .filter((b: any) => b.url && !b.url.startsWith('/') && !b.url.startsWith('tel:') && !b.url.startsWith('mailto:'))
    .map((b: any) => ({ label: b.label, url: b.url }));

  let popupSettings = null;
  try {
    popupSettings = await p.popupSettings?.findFirst?.({ where: { id: 1 } }).catch(() => null) ?? null;
  } catch {}

  let heroData: { settings: any; slides: any[]; featureCards: any[] } | null = null;
  try {
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
  } catch {}

  return (
    <div className="min-h-screen bg-gray-50">
      {faqSchemaItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqSchemaItems }) }}
        />
      )}
      <VisitTracker page="menu" />
      <MenuClient
        categories={categories}
        promos={promos}
        reviews={reviews}
        faqs={faqs}
        site={site}
        locale={LOCALE}
        heroData={heroData as any}
        notifBar={banners.length === 0 ? notifBar : undefined}
        banners={banners}
        openingHours={openingHours}
        orderLinks={orderLinks}
        popupSettings={popupSettings}
      />
    </div>
  );
}
