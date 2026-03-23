'use client';

import { useRef, useState, useEffect } from 'react';

interface Props {
  promos: any[];
  locale: string;
  primaryColor: string;
}

export default function PromoSlider({ promos, locale, primaryColor }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function checkScroll() {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    checkScroll();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [promos]);

  function scroll(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * 340, behavior: 'smooth' });
  }

  return (
    <div className="relative group/slider">
      {/* Left arrow */}
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all opacity-0 group-hover/slider:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}

      {/* Right arrow */}
      {canRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all opacity-0 group-hover/slider:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}

      {/* Scrollable track */}
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {promos.map(promo => {
          const t = promo.translations?.[0];

          if (promo.photoOnly && promo.bgImageUrl) {
            return (
              <div
                key={promo.id}
                className="flex-shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden"
                style={{ aspectRatio: '16/7', scrollSnapAlign: 'start' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={promo.bgImageUrl} alt={t?.title || ''} className="w-full h-full object-cover" />
              </div>
            );
          }

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
              className="flex-shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden relative"
              style={{ ...bgStyle, minHeight: '130px', scrollSnapAlign: 'start' }}
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
    </div>
  );
}
