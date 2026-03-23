import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import LinktreeCover from '@/components/linktree/LinktreeCover';
import LinktreeProfile from '@/components/linktree/LinktreeProfile';
import LinktreeButtons from '@/components/linktree/LinktreeButtons';
import LinktreeHours from '@/components/linktree/LinktreeHours';
import LinktreePromos from '@/components/linktree/LinktreePromos';
import LinktreeFAQs from '@/components/linktree/LinktreeFAQs';
import LinktreeFooter from '@/components/linktree/LinktreeFooter';

export const dynamic = 'force-dynamic';

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
      include: { translations: { where: { locale } } },
    }),
    prisma.fAQ.findMany({
      where: { isVisible: true, showOnLinktree: true },
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
  }));
  const faqsList = faqs.status === 'fulfilled' ? faqs.value : [];
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

  return (
    <div className="min-h-screen" style={bgStyle}>
      <div className="max-w-md mx-auto pb-12">
        <LinktreeCover settings={settings} site={site} />
        <LinktreeProfile settings={settings} site={site} />
        {settings?.showPromos && promotions.length > 0 && <LinktreePromos promos={promotions} locale={locale} />}
        <LinktreeButtons buttons={buttons} locale={locale} />
        {settings?.showHours && openHours.length > 0 && <LinktreeHours hours={openHours} locale={locale} />}
        {settings?.showFaqs && faqsList.length > 0 && <LinktreeFAQs faqs={faqsList} locale={locale} />}
        <LinktreeFooter site={site} footer={footer} />
      </div>
      {(() => {
        const enabledLocales: string[] = (() => { try { return JSON.parse(site?.enabledLocales || '["fr","en","it","es"]'); } catch { return ['fr','en','it','es']; } })();
        const allLocales = [['fr', 'FR'], ['en', 'EN'], ['it', 'IT'], ['es', 'ES']] as const;
        const visibleLocales = allLocales.filter(([code]) => enabledLocales.includes(code));
        if (visibleLocales.length <= 1) return null;
        return (
          <div className="fixed top-3 right-3 z-40">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
              {visibleLocales.map(([code, label]) => (
                <a
                  key={code}
                  href={code === 'fr' ? '/linktree' : `/${code}/linktree`}
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${code === locale ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'}`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
