'use client';

import { ArrowRightIcon } from '@/components/ui/icons';

interface Promo {
  id: number;
  type: string;
  bgType: string;
  bgColor: string;
  bgGradient?: string | null;
  bgImageUrl?: string | null;
  textColor: string;
  badgeText?: string | null;
  badgeColor: string;
  originalPrice?: any;
  promoPrice: any;
  translations: { title: string; description?: string | null; cta?: string | null; ctaUrl?: string | null }[];
}

interface Props {
  promos: Promo[];
  locale: string;
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  fr: { delivery: 'En livraison', takeaway: 'À emporter', onsite: 'Sur place', all: 'Toutes offres' },
  en: { delivery: 'Delivery', takeaway: 'Takeaway', onsite: 'On Site', all: 'All offers' },
  it: { delivery: 'Consegna', takeaway: 'Asporto', onsite: 'In loco', all: 'Tutte le offerte' },
  es: { delivery: 'Entrega', takeaway: 'Para llevar', onsite: 'En el local', all: 'Todas las ofertas' },
};

const SECTION_LABELS: Record<string, string> = {
  fr: 'Promotions du Moment',
  en: 'Current Promotions',
  it: 'Promozioni del Momento',
  es: 'Promociones del Momento',
};

export default function LinktreePromos({ promos, locale }: Props) {
  return (
    <div className="mx-5 mt-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
        <span className="flex-1 h-px bg-gray-700" />
        {SECTION_LABELS[locale] || SECTION_LABELS.fr}
        <span className="flex-1 h-px bg-gray-700" />
      </p>

      <div className="space-y-3">
        {promos.map((promo) => {
          const t = promo.translations[0];
          if (!t) return null;

          const bgStyle =
            promo.bgType === 'image' && promo.bgImageUrl
              ? { backgroundImage: `url(${promo.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : promo.bgType === 'gradient' && promo.bgGradient
              ? { background: promo.bgGradient }
              : { backgroundColor: promo.bgColor };

          const labels = TYPE_LABELS[locale] || TYPE_LABELS.fr;

          return (
            <div
              key={promo.id}
              className="promo-card relative overflow-hidden rounded-2xl"
              style={bgStyle}
            >
              {promo.bgType === 'image' && (
                <div className="absolute inset-0 bg-black/50" />
              )}
              <div className="relative z-10 p-4" style={{ color: promo.textColor }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex flex-wrap gap-1.5">
                    {promo.badgeText && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: promo.badgeColor }}
                      >
                        {promo.badgeText}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md bg-white/20">
                      {labels[promo.type] || promo.type}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-base leading-tight mt-1">{t.title}</h3>
                {t.description && (
                  <p className="text-sm opacity-80 mt-0.5 leading-snug">{t.description}</p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-baseline gap-2">
                    {promo.originalPrice && (
                      <span className="text-sm line-through opacity-60">
                        {parseFloat(promo.originalPrice).toFixed(2)}€
                      </span>
                    )}
                    <span className="text-2xl font-black">
                      {parseFloat(promo.promoPrice).toFixed(2)}€
                    </span>
                  </div>
                  {t.ctaUrl && t.cta && (
                    <a
                      href={t.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1"
                    >
                      {t.cta}
                      <ArrowRightIcon className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
