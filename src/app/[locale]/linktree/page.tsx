import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { pickBestTranslation } from '@/lib/menu-data';
import VisitTracker from '@/components/VisitTracker';
import LinktreeCover from '@/components/linktree/LinktreeCover';
import LinktreeProfile from '@/components/linktree/LinktreeProfile';
import LinktreeButtons from '@/components/linktree/LinktreeButtons';
import LinktreeHours from '@/components/linktree/LinktreeHours';
import LinktreePromos from '@/components/linktree/LinktreePromos';
import LinktreeFAQs from '@/components/linktree/LinktreeFAQs';
import LinktreeFooter from '@/components/linktree/LinktreeFooter';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export const revalidate = 30;

type Props = { params: Promise<{ locale: string }> };

export default async function LinktreePage({ params }: Props) {
  const { locale } = await params;

  const [ltSettings, ltButtons, hours, promos, faqs, siteSettings, footerData] = await Promise.allSettled([
    prisma.linktreeSettings.findFirst(),
    prisma.linktreeButton.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.openingHours.findMany({ orderBy: { dayOfWeek: 'asc' } }),
    prisma.promotion.findMany({
      where: { isVisible: true, showOnLinktree: true },
      orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale: { in: [...new Set([locale, 'fr'])] } } } },
    }),
    prisma.fAQ.findMany({
      where: { isVisible: true, showOnMenu: true },
      orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale } } },
    }),
    prisma.siteSettings.findFirst(),
    prisma.footerSettings.findFirst(),
  ]);

  const settings = ltSettings.status === 'fulfilled' ? ltSettings.value : null;
  const buttons = ltButtons.status === 'fulfilled' ? ltButtons.value : [];
  const openHours = hours.status === 'fulfilled' ? hours.value : [];
  const promotions = (promos.status === 'fulfilled' ? promos.value : []).map((p: any) => ({
    ...p,
    promoPrice: p.promoPrice != null ? p.promoPrice.toString() : null,
    originalPrice: p.originalPrice != null ? p.originalPrice.toString() : null,
    translations: pickBestTranslation(p.translations || [], locale),
  }));
  const faqsList = faqs.status === 'fulfilled' ? faqs.value : [];
  const faqSchemaItems = (faqsList as any[]).filter(f => f.translations?.[0]).map(f => ({
    '@type': 'Question',
    name: f.translations[0].question,
    acceptedAnswer: { '@type': 'Answer', text: f.translations[0].answer },
  }));
  const site = siteSettings.status === 'fulfilled' ? siteSettings.value : null;
  const footer = footerData.status === 'fulfilled' ? footerData.value : null;

  // Redirect to FR if this locale is disabled
  const enabledLocales: string[] = (() => {
    try { return JSON.parse(site?.enabledLocales || '["fr","en","it","es"]'); } catch { return ['fr','en','it','es']; }
  })();
  if (!enabledLocales.includes(locale)) redirect('/linktree');

  const bgStyle = settings?.bgImageUrl
    ? { backgroundImage: `url(${settings.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: settings?.bgColor || '#111827' };

  const allLocales = [['fr', 'FR'], ['en', 'EN'], ['it', 'IT'], ['es', 'ES']] as const;
  const visibleLocales = allLocales.filter(([code]) => enabledLocales.includes(code));

  return (
    <div className="min-h-screen" style={bgStyle}>
      {settings?.showFaqs && faqSchemaItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqSchemaItems }) }}
        />
      )}
      <VisitTracker page="linktree" />
      <div className="max-w-md mx-auto pb-12 relative">
        {visibleLocales.length > 1 && (
          <div className="absolute top-3 right-3 z-40">
            <LanguageSwitcher
              locale={locale}
              options={visibleLocales.map(([code]) => ({
                code,
                href: code === 'fr' ? '/linktree' : `/${code}/linktree`,
              }))}
            />
          </div>
        )}
        <LinktreeCover settings={settings} site={site} />
        <LinktreeProfile settings={settings} site={site} hours={openHours} locale={locale} />
        {settings?.showPromos && promotions.length > 0 && <LinktreePromos promos={promotions} locale={locale} />}
        <LinktreeButtons buttons={buttons} locale={locale} />
        {settings?.showHours && openHours.length > 0 && <LinktreeHours hours={openHours} locale={locale} />}
        {settings?.showFaqs && faqsList.length > 0 && <LinktreeFAQs faqs={faqsList} locale={locale} />}
        <LinktreeFooter site={site} footer={footer} />
      </div>
    </div>
  );
}
