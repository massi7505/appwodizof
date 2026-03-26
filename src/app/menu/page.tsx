import MenuClient from '@/components/menu/MenuClient';
import VisitTracker from '@/components/VisitTracker';
import {
  fetchMenuCoreData,
  fetchMenuSecondaryData,
  fetchHeroData,
  fetchPopupSettings,
} from '@/lib/menu-data';

export const revalidate = 30;

const LOCALE = 'fr';

export default async function MenuPageFR() {
  const [core, secondary, heroData, popupSettings] = await Promise.all([
    fetchMenuCoreData(LOCALE),
    fetchMenuSecondaryData(),
    fetchHeroData(),
    fetchPopupSettings(),
  ]);

  const { categories, promos, reviews, faqs, notifBar, site } = core;
  const { banners, openingHours, orderLinks } = secondary;

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
