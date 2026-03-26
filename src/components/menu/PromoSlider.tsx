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

        const isImageBg = promo.bgType === 'image' && promo.bgImageUrl;
        const bgStyle = isImageBg
          ? {}
          : promo.bgType === 'gradient' && promo.bgGradient
          ? { background: promo.bgGradient }
          : { backgroundColor: promo.bgColor || '#F59E0B' };

        const textCol = promo.textColor || '#fff';

        // ── Photo-only card ──
        if (promo.photoOnly && promo.bgImageUrl) {
          return (
            <div key={promo.id}
              className="relative w-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{ height: 'clamp(160px, 40vw, 240px)' }}>
              <Image src={promo.bgImageUrl} alt={tr?.title || ''} fill
                sizes="(max-width: 640px) 100vw, 320px" quality={75} priority={isPriority}
                className="object-cover" />
            </div>
          );
        }

        const badgeText = (() => {
          try { const b = JSON.parse(promo.badgeText || '{}'); return b[locale] || b.fr || null; }
          catch { return promo.badgeText || null; }
        })();

        // ── Regular card ──
        return (
          <div key={promo.id}
            className="group relative w-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{ ...bgStyle, minHeight: 'clamp(160px, 40vw, 240px)', color: textCol }}>

            {/* Background image + overlay */}
            {isImageBg && (
              <>
                <Image src={promo.bgImageUrl} alt="" fill
                  sizes="(max-width: 640px) 100vw, 320px" quality={75} priority={isPriority}
                  className="object-cover" />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(170deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.88) 100%)' }} />
              </>
            )}

            {/* Decorative circle for solid/gradient cards */}
            {!isImageBg && (
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            )}

            {/* Top row: badges */}
            <div className="relative z-10 flex items-start justify-between gap-1 p-2 sm:p-3">
              <div className="flex flex-wrap gap-1.5">
                {badgeText && (
                  <span className="font-black uppercase px-2.5 py-1 rounded-full shadow-sm tracking-wide"
                    style={{
                      backgroundColor: promo.badgeColor || '#EF4444',
                      color: autoTextColor(promo.badgeColor || '#EF4444'),
                      fontSize: `${promo.badgeSize || 10}px`,
                    }}>
                    {badgeText}
                  </span>
                )}
              </div>
              {showExpiry && (
                <span className="flex-shrink-0 bg-red-500 text-white font-black px-2 py-0.5 rounded-full tracking-wide uppercase shadow-sm"
                  style={{ fontSize: '9px' }}>
                  {expiryFn(days!)}
                </span>
              )}
            </div>

            {/* Spacer to push content to bottom */}
            <div className="flex-1" />

            {/* Bottom content */}
            <div className="relative z-10 p-2.5 sm:p-4 sm:pt-2">
              {tr?.title && (
                <p className="font-black leading-tight mb-1 line-clamp-2"
                  style={{
                    fontSize: `clamp(12px, 2.5vw, ${promo.titleSize || 16}px)`,
                    textShadow: isImageBg ? '0 1px 10px rgba(0,0,0,0.7)' : 'none',
                  }}>
                  {tr.title}
                </p>
              )}

              {tr?.description && (
                <p className="opacity-70 mb-1.5 line-clamp-2 leading-snug hidden sm:block"
                  style={{ fontSize: `${promo.descSize || 11}px` }}>
                  {tr.description}
                </p>
              )}

              {/* Price row */}
              {promoP && (
                <div className="flex items-baseline gap-1 mb-2">
                  {origP && (
                    <span className="line-through opacity-50"
                      style={{ fontSize: `clamp(9px, 2vw, ${Math.max(10, (promo.priceSize || 22) - 8)}px)` }}>
                      {origP}€
                    </span>
                  )}
                  <span className="font-black leading-none"
                    style={{
                      fontSize: `clamp(14px, 4vw, ${promo.priceSize || 22}px)`,
                      textShadow: isImageBg ? '0 1px 10px rgba(0,0,0,0.6)' : 'none',
                    }}>
                    {promoP}€
                  </span>
                </div>
              )}

              {/* CTA button — hidden on mobile (cards too narrow) */}
              {tr?.ctaUrl && tr?.cta && (
                <a href={tr.ctaUrl} target="_blank" rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-black transition-all hover:scale-105 hover:shadow-lg active:scale-95 mb-1"
                  style={{
                    fontSize: `${promo.ctaSize || 12}px`,
                    backgroundColor: primaryColor,
                    color: autoTextColor(primaryColor),
                  }}>
                  {tr.cta}
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {/* Availability */}
              {promo.availFrom && promo.availTo && (
                <p className="opacity-55 mt-1.5 flex items-center gap-1" style={{ fontSize: '10px' }}>
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
