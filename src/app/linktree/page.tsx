import { prisma } from '@/lib/db';
import NotificationBarComponent from '@/components/linktree/NotificationBar';
import LinktreeCover from '@/components/linktree/LinktreeCover';
import LinktreeProfile from '@/components/linktree/LinktreeProfile';
import LinktreeButtons from '@/components/linktree/LinktreeButtons';
import LinktreeHours from '@/components/linktree/LinktreeHours';
import LinktreePromos from '@/components/linktree/LinktreePromos';
import LinktreeFAQs from '@/components/linktree/LinktreeFAQs';
import LinktreeFooter from '@/components/linktree/LinktreeFooter';

const LOCALE = 'fr';

export default async function LinktreePageFR() {
  const [ltSettings, ltButtons, hours, promos, faqs, nbData, siteSettings, footerData] = await Promise.allSettled([
    prisma.linktreeSettings.findFirst(),
    prisma.linktreeButton.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.openingHours.findMany({ orderBy: { dayOfWeek: 'asc' } }),
    prisma.promotion.findMany({
      where: { isVisible: true, showOnLinktree: true },
      orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale: LOCALE } } },
    }),
    prisma.fAQ.findMany({
      where: { isVisible: true, showOnLinktree: true },
      orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale: LOCALE } } },
    }),
    prisma.notificationBar.findFirst({ include: { translations: { where: { locale: LOCALE } } } }),
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
  const notifBar = nbData.status === 'fulfilled' ? nbData.value : null;
  const site = siteSettings.status === 'fulfilled' ? siteSettings.value : null;
  const footer = footerData.status === 'fulfilled' ? footerData.value : null;

  const bgStyle = settings?.bgImageUrl
    ? { backgroundImage: `url(${settings.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: settings?.bgColor || '#111827' };

  return (
    <div className="min-h-screen" style={bgStyle}>
      {notifBar?.isVisible && <NotificationBarComponent bar={notifBar} locale={LOCALE} />}
      <div className="max-w-md mx-auto pb-12">
        <LinktreeCover settings={settings} />
        <LinktreeProfile settings={settings} site={site} />
        {settings?.showPromos && promotions.length > 0 && <LinktreePromos promos={promotions} locale={LOCALE} />}
        <LinktreeButtons buttons={buttons} />
        {settings?.showHours && openHours.length > 0 && <LinktreeHours hours={openHours} locale={LOCALE} />}
        {settings?.showFaqs && faqsList.length > 0 && <LinktreeFAQs faqs={faqsList} locale={LOCALE} />}
        <LinktreeFooter site={site} footer={footer} />
      </div>
      <div className="fixed top-3 right-3 z-40">
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
          {[['fr','FR'],['en','EN'],['it','IT'],['es','ES']].map(([code, label]) => (
            <a key={code} href={code === 'fr' ? '/linktree' : `/${code}/linktree`}
              className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${code === LOCALE ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'}`}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
