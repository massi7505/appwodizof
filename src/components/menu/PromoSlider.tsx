'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { autoTextColor } from '@/lib/color';

interface Props {
  promos: any[];
  locale: string;
  primaryColor: string;
}

const AVAIL_LABEL: Record<string, (from: string, to: string) => string> = {
  fr: (f, t) => `Dispo de ${f} à ${t}`,
  en: (f, t) => `Available ${f}–${t}`,
  it: (f, t) => `Dalle ${f} alle ${t}`,
  es: (f, t) => `De ${f} a ${t}`,
};

const EXPIRY_LABELS: Record<string, (d: number) => string> = {
  fr: d => d === 0 ? 'Expire aujourd\'hui !' : `Expire dans ${d}j`,
  en: d => d === 0 ? 'Expires today!' : `Expires in ${d}d`,
  it: d => d === 0 ? 'Scade oggi!' : `Scade in ${d}g`,
  es: d => d === 0 ? '¡Expira hoy!' : `Expira en ${d}d`,
};

function daysUntilExpiry(endsAt: string | null | undefined): number | null {
  if (!endsAt) return null;
  const end = new Date(endsAt);
  const now = new Date();
  end.setHours(23, 59, 59, 999);
  return Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function isPromoActive(promo: any): boolean {
  const now = Date.now();
  if (promo.startsAt && new Date(promo.startsAt).getTime() > now) return false;
  if (promo.endsAt && new Date(promo.endsAt).getTime() < now - 86_400_000) return false;
  return true;
}

function safePrice(val: any): string | null {
  if (val == null) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n.toFixed(2);
}

export default function PromoSlider({ promos, locale, primaryColor }: Props) {
  const [activePromos, setActivePromos] = useState<any[]>(promos);
  const [promoDays, setPromoDays] = useState<Record<number, number | null>>({});

  useEffect(() => {
    const filtered = promos.filter(isPromoActive);
    setActivePromos(filtered);
    const days: Record<number, number | null> = {};
    filtered.forEach(p => { days[p.id] = daysUntilExpiry(p.endsAt); });
    setPromoDays(days);
  }, [promos]);

  if (activePromos.length === 0) return null;

  const expiryFn = EXPIRY_LABELS[locale] || EXPIRY_LABELS.fr;

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {activePromos.map((promo, i) => {
        const tr = promo.translations?.[0];
        const days = promoDays[promo.id] ?? null;
        const showExpiry = days !== null && days <= 6 && days >= 0;
        const promoP = safePrice(promo.promoPrice);
        const origP = safePrice(promo.originalPrice);
        const isPriority = i === 0;

        // Last item alone on mobile (odd total) → span 2 cols, landscape ratio
        const isLastOdd = i === activePromos.length - 1 && activePromos.length % 2 !== 0;

        const isImageBg = promo.bgType === 'image' && promo.bgImageUrl;
        const bgStyle = isImageBg
          ? {}
          : promo.bgType === 'gradient' && promo.bgGradient
          ? { background: promo.bgGradient }
          : { backgroundColor: promo.bgColor || '#F59E0B' };

        const textCol = promo.textColor || '#fff';

        const badgeText = (() => {
          try { const b = JSON.parse(promo.badgeText || '{}'); return b[locale] || b.fr || null; }
          catch { return promo.badgeText || null; }
        })();

        // Discount % pill (only if both prices exist and promo is cheaper)
        const discountPct = (promoP && origP)
          ? Math.round((1 - parseFloat(promoP) / parseFloat(origP)) * 100)
          : null;

        // Card aspect ratio: landscape for lone last card on mobile, portrait elsewhere
        const aspectClass = isLastOdd
          ? 'aspect-[16/7] sm:aspect-[3/4]'
          : 'aspect-[3/4]';

        // ── Photo-only card ──
        if (promo.photoOnly && promo.bgImageUrl) {
          return (
            <div key={promo.id}
              className={`relative w-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${aspectClass} ${isLastOdd ? 'col-span-2 sm:col-span-1' : ''}`}>
              <Image src={promo.bgImageUrl} alt={tr?.title || ''} fill
                sizes="(max-width: 640px) 100vw, 320px" quality={80} priority={isPriority}
                className="object-cover" />
            </div>
          );
        }

        // ── Regular card ──
        return (
          <div key={promo.id}
            className={`group relative w-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${aspectClass} ${isLastOdd ? 'col-span-2 sm:col-span-1' : ''}`}
            style={{ ...bgStyle, color: textCol }}>

            {/* Background image + strong bottom gradient */}
            {isImageBg && (
              <>
                <Image src={promo.bgImageUrl} alt="" fill
                  sizes="(max-width: 640px) 100vw, 320px" quality={80} priority={isPriority}
                  className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.82) 75%, rgba(0,0,0,0.95) 100%)' }} />
              </>
            )}

            {/* Decorative circles for solid / gradient cards */}
            {!isImageBg && (
              <>
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
                <div className="absolute top-4 -right-4 w-14 h-14 rounded-full pointer-events-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full pointer-events-none"
                  style={{ backgroundColor: 'rgba(0,0,0,0.12)' }} />
              </>
            )}

            {/* ── Top row: badge + expiry ── */}
            <div className="relative z-10 flex items-start justify-between gap-1 p-2 sm:p-3 flex-shrink-0">
              {badgeText ? (
                <span className="font-black uppercase rounded-md shadow tracking-wide leading-none px-1.5 py-1 sm:px-2.5 sm:py-1"
                  style={{
                    backgroundColor: promo.badgeColor || '#EF4444',
                    color: autoTextColor(promo.badgeColor || '#EF4444'),
                    fontSize: `clamp(7px, 1.8vw, ${promo.badgeSize || 10}px)`,
                  }}>
                  {badgeText}
                </span>
              ) : <span />}

              <div className="flex flex-col items-end gap-1">
                {showExpiry && (
                  <span className="bg-red-500 text-white font-black rounded-md leading-none tracking-wide uppercase shadow px-1.5 py-1"
                    style={{ fontSize: 'clamp(7px, 1.6vw, 9px)' }}>
                    {expiryFn(days!)}
                  </span>
                )}
                {discountPct !== null && discountPct > 0 && (
                  <span className="font-black rounded-md leading-none shadow px-1.5 py-1"
                    style={{
                      fontSize: 'clamp(7px, 1.6vw, 9px)',
                      backgroundColor: '#22c55e',
                      color: '#052e16',
                    }}>
                    -{discountPct}%
                  </span>
                )}
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* ── Bottom content ── */}
            <div className="relative z-10 p-2 sm:p-3 flex-shrink-0">
              {tr?.title && (
                <p className="font-black leading-tight line-clamp-2 mb-0.5"
                  style={{
                    fontSize: `clamp(11px, 2.8vw, ${promo.titleSize || 15}px)`,
                    textShadow: isImageBg ? '0 1px 6px rgba(0,0,0,0.9)' : 'none',
                  }}>
                  {tr.title}
                </p>
              )}

              {tr?.description && (
                <p className="opacity-75 line-clamp-1 leading-snug mb-1 hidden sm:block"
                  style={{ fontSize: `${promo.descSize || 11}px` }}>
                  {tr.description}
                </p>
              )}

              {/* Price */}
              {promoP && (
                <div className="flex items-baseline gap-1 mt-0.5">
                  {origP && (
                    <span className="line-through opacity-55"
                      style={{ fontSize: `clamp(9px, 2vw, ${Math.max(10, (promo.priceSize || 20) - 6)}px)` }}>
                      {origP}€
                    </span>
                  )}
                  <span className="font-black leading-none"
                    style={{
                      fontSize: `clamp(14px, 4.2vw, ${promo.priceSize || 22}px)`,
                      textShadow: isImageBg ? '0 1px 8px rgba(0,0,0,0.9)' : 'none',
                    }}>
                    {promoP}€
                  </span>
                </div>
              )}

              {/* CTA — desktop only */}
              {tr?.ctaUrl && tr?.cta && (
                <a href={tr.ctaUrl} target="_blank" rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full font-black transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                  style={{
                    fontSize: `${promo.ctaSize || 11}px`,
                    backgroundColor: primaryColor,
                    color: autoTextColor(primaryColor),
                  }}>
                  {tr.cta}
                  <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {/* Availability — desktop only */}
              {promo.availFrom && promo.availTo && (
                <p className="opacity-55 mt-1 hidden sm:flex items-center gap-1" style={{ fontSize: '9px' }}>
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/>
                  </svg>
                  {(AVAIL_LABEL[locale] || AVAIL_LABEL.fr)(promo.availFrom, promo.availTo)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
