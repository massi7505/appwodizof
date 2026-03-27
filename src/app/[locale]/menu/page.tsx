import { redirect } from 'next/navigation';
import MenuClient from '@/components/menu/MenuClient';
import VisitTracker from '@/components/VisitTracker';
import {
  fetchMenuCoreData,
  fetchMenuSecondaryData,
  fetchHeroData,
  fetchPopupSettings,
} from '@/lib/menu-data';

export const revalidate = 30;

type Props = { params: Promise<{ locale: string }> };

export default async function MenuPage({ params }: Props) {
  const { locale } = await params;

  const [core, secondary, heroData, popupSettings] = await Promise.all([
    fetchMenuCoreData(locale),
    fetchMenuSecondaryData(),
    fetchHeroData(),
    fetchPopupSettings(),
  ]);

  const { categories, promos, reviews, faqs, notifBar, site } = core;
  const { banners, openingHours, orderLinks, footerSettings } = secondary;

  const enabledLocales: string[] = (() => {
    try { return JSON.parse(site?.enabledLocales || '["fr","en","it","es"]'); }
    catch { return ['fr', 'en', 'it', 'es']; }
  })();

  if (!enabledLocales.includes(locale)) redirect('/menu');

  const faqSchemaItems = faqs
    .filter((f: any) => f.translations?.[0])
    .map((f: any) => ({
      '@type': 'Question',
      name: f.translations[0].question,
      acceptedAnswer: { '@type': 'Answer', text: f.translations[0].answer },
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      {faqSchemaItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqSchemaItems,
            }),
          }}
        />
      )}
      <VisitTracker page="menu" />
      <MenuClient
        categories={categories}
        promos={promos}
        reviews={reviews}
        faqs={faqs}
        site={site}
        locale={locale}
        heroData={heroData as any}
        notifBar={banners.length === 0 ? notifBar : undefined}
        banners={banners}
        openingHours={openingHours}
        orderLinks={orderLinks}
        footerSettings={footerSettings}
        popupSettings={popupSettings}
      />
    </div>
  );
}
