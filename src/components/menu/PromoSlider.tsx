'use client';

import { useRef, useState, useEffect } from 'react';

interface Props {
  promos: any[];
  locale: string;
  primaryColor: string;
}

const EXPIRY_LABELS: Record<string, (d: number) => string> = {
  fr: d => d === 0 ? 'Expire aujourd\'hui !' : `Expire dans ${d}j`,
  en: d => d === 0 ? 'Expires today!' : `Expires in ${d}d`,
  it: d => d === 0 ? 'Scade oggi!' : `Scade in ${d}g`,
  es: d => d === 0 ? '¡Expira hoy!' : `Expira en ${d}d`,
};

/** Returns days until expiry (0 = today, -1 = already expired), or null if no endsAt */
function daysUntilExpiry(endsAt: string | null | undefined): number | null {
  if (!endsAt) return null;
  const end = new Date(endsAt);
  const now = new Date();
  end.setHours(23, 59, 59, 999);
  const diff = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

/** Returns true if promo is currently active (considering startsAt / endsAt) */
function isPromoActive(promo: any): boolean {
  const now = Date.now();
  if (promo.startsAt && new Date(promo.startsAt).getTime() > now) return false;
  if (promo.endsAt && new Date(promo.endsAt).getTime() < now - 86_400_000) return false; // grace: end of day
  return true;
}

function safePrice(val: any): string | null {
  if (val == null) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n.toFixed(2);
}

export default function PromoSlider({ promos, locale, primaryColor }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Client-side date filter (avoids hydration mismatch)
  const [activePromos, setActivePromos] = useState<any[]>(promos);
  useEffect(() => {
    setActivePromos(promos.filter(isPromoActive));
  }, [promos]);

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
  }, [activePromos]);

  function scroll(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * 340, behavior: 'smooth' });
  }

  if (activePromos.length === 0) return null;

  const expiryFn = EXPIRY_LABELS[locale] || EXPIRY_LABELS.fr;

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
        {activePromos.map(promo => {
          const t = promo.translations?.[0];
          const days = daysUntilExpiry(promo.endsAt);
          const showExpiry = days !== null && days <= 6 && days >= 0;
          const promoP = safePrice(promo.promoPrice);
          const origP = safePrice(promo.originalPrice);

          if (promo.photoOnly && promo.bgImageUrl) {
            return (
              <div key={promo.id} className="flex-shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden"
                style={{ aspectRatio: '16/7', scrollSnapAlign: 'start' }}>
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

          return (
            <div key={promo.id} className="flex-shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden relative"
              style={{ ...bgStyle, minHeight: '140px', scrollSnapAlign: 'start' }}>

              {promo.bgType === 'image' && promo.bgImageUrl && (
                <div className="absolute inset-0 bg-black/40" />
              )}

              {/* Expiry ribbon */}
              {showExpiry && (
                <div className="absolute top-0 right-0 z-20">
                  <div className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg tracking-wide uppercase">
                    {expiryFn(days!)}
                  </div>
                </div>
              )}

              <div className="relative z-10 p-4 h-full flex flex-col justify-between" style={{ color: promo.textColor }}>
                <div>
                  {/* Badges row */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(() => { try { const b = JSON.parse(promo.badgeText || '{}'); return b[locale] || b.fr || null; } catch { return promo.badgeText || null; } })() && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                        style={{ backgroundColor: promo.badgeColor, color: '#fff' }}>
                        {(() => { try { const b = JSON.parse(promo.badgeText || '{}'); return b[locale] || b.fr || promo.badgeText; } catch { return promo.badgeText; } })()}
                      </span>
                    )}
                  </div>
                  {t?.title && <p className="font-bold text-base leading-snug">{t.title}</p>}
                  {t?.description && (
                    <p className="text-xs opacity-80 mt-1 line-clamp-2">{t.description}</p>
                  )}
                </div>

                {/* Bottom: price + CTA */}
                <div className="flex items-end justify-between mt-3 gap-2">
                  {promoP && (
                    <div className="flex items-baseline gap-1.5">
                      {origP && (
                        <span className="text-xs line-through opacity-50">{origP}€</span>
                      )}
                      <span className="text-2xl font-black leading-none">{promoP}€</span>
                    </div>
                  )}
                  {t?.ctaUrl && t?.cta && (
                    <a href={t.ctaUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:scale-105 flex items-center gap-1"
                      style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}>
                      {t.cta}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
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
