'use client';

interface Props {
  promos: any[];
  locale: string;
  primaryColor: string;
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  fr: { delivery: 'En livraison', takeaway: 'À emporter', onsite: 'Sur place', all: 'Toutes offres' },
  en: { delivery: 'Delivery', takeaway: 'Takeaway', onsite: 'On Site', all: 'All offers' },
  it: { delivery: 'Consegna', takeaway: 'Asporto', onsite: 'In loco', all: 'Tutte' },
  es: { delivery: 'Entrega', takeaway: 'Para llevar', onsite: 'En local', all: 'Todas' },
};

export default function PromoSlider({ promos, locale, primaryColor }: Props) {
  const labels = TYPE_LABELS[locale] || TYPE_LABELS.fr;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {promos.map(promo => {
        const t = promo.translations[0];

        // ── Photo-only mode ──────────────────────────────────────
        if (promo.photoOnly && promo.bgImageUrl) {
          return (
            <div
              key={promo.id}
              className="flex-shrink-0 w-80 sm:w-96 rounded-2xl overflow-hidden"
              style={{ aspectRatio: '16/7' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={promo.bgImageUrl}
                alt={t?.title || ''}
                className="w-full h-full object-cover"
              />
            </div>
          );
        }

        if (!t) return null;

        const bgStyle =
          promo.bgType === 'image' && promo.bgImageUrl
            ? { backgroundImage: `url(${promo.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : promo.bgType === 'gradient' && promo.bgGradient
            ? { background: promo.bgGradient }
            : { backgroundColor: promo.bgColor };

        const hasContent = t?.title || promo.badgeText || promo.promoPrice;

        return (
          <div
            key={promo.id}
            className="flex-shrink-0 w-80 sm:w-96 rounded-2xl overflow-hidden relative"
            style={{ ...bgStyle, minHeight: '130px' }}
          >
            {promo.bgType === 'image' && promo.bgImageUrl && (
              <div className="absolute inset-0 bg-black/40" />
            )}
            {hasContent && (
              <div className="relative p-5" style={{ color: promo.textColor }}>
                {promo.badgeText && (
                  <div className="mb-2">
                    <span
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                      style={{ backgroundColor: promo.badgeColor, color: '#fff' }}
                    >
                      {promo.badgeText}
                    </span>
                  </div>
                )}
                {t?.title && <p className="font-bold text-base leading-snug">{t.title}</p>}
                {t?.description && (
                  <p className="text-xs opacity-80 mt-1 line-clamp-2">{t.description}</p>
                )}
                {promo.promoPrice && (
                  <div className="flex items-baseline gap-2 mt-3">
                    {promo.originalPrice && (
                      <span className="text-xs line-through opacity-60">
                        {parseFloat(promo.originalPrice).toFixed(2)}€
                      </span>
                    )}
                    <span className="text-2xl font-black">
                      {parseFloat(promo.promoPrice).toFixed(2)}€
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
