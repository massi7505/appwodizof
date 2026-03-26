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
    <div>
      {/* Mobile: stacked vertically — Desktop: grid, all cards visible */}
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
            : { backgroundColor: promo.bgColor };

          // Photo-only card
          if (promo.photoOnly && promo.bgImageUrl) {
            return (
              <div key={promo.id}
                className="relative w-full rounded-2xl overflow-hidden"
                style={{ height: '220px' }}>
                <Image src={promo.bgImageUrl} alt={tr?.title || ''} fill
                  sizes="(max-width: 640px) 100vw, 320px" quality={70} priority={isPriority}
                  className="object-cover" />
              </div>
            );
          }

          const badgeText = (() => {
            try { const b = JSON.parse(promo.badgeText || '{}'); return b[locale] || b.fr || null; }
            catch { return promo.badgeText || null; }
          })();

          return (
            <div key={promo.id}
              className="group w-full rounded-2xl overflow-hidden relative"
              style={{ ...bgStyle, height: '220px' }}>

              {/* Background image */}
              {isImageBg && (
                <>
                  <Image src={promo.bgImageUrl} alt="" fill
                    sizes="(max-width: 640px) 100vw, 320px" quality={70} priority={isPriority}
                    className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  {/* Bottom gradient for readability */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.40) 50%, rgba(0,0,0,0.10) 100%)' }} />
                </>
              )}

              {/* Top-right: expiry badge */}
              {showExpiry && (
                <div className="absolute top-3 right-3 z-20">
                  <span className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-lg tracking-wide uppercase shadow">
                    {expiryFn(days!)}
                  </span>
                </div>
              )}

              {/* Top-left: promo badge */}
              {badgeText && (
                <div className="absolute top-3 left-3 z-20">
                  <span className="font-black uppercase px-2.5 py-1 rounded-lg shadow"
                    style={{
                      backgroundColor: promo.badgeColor,
                      color: autoTextColor(promo.badgeColor),
                      fontSize: `${promo.badgeSize || 10}px`,
                    }}>
                    {badgeText}
                  </span>
                </div>
              )}

              {/* Content — bottom */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-4" style={{ color: promo.textColor }}>
                {tr?.title && (
                  <p className="font-black leading-snug mb-1 line-clamp-2"
                    style={{
                      fontSize: `${promo.titleSize || 16}px`,
                      textShadow: isImageBg ? '0 1px 8px rgba(0,0,0,0.6)' : 'none',
                    }}>
                    {tr.title}
                  </p>
                )}
                {tr?.description && (
                  <p className="opacity-75 mb-2 line-clamp-1"
                    style={{ fontSize: `${promo.descSize || 12}px` }}>
                    {tr.description}
                  </p>
                )}

                {/* Price + CTA row */}
                <div className="flex items-end justify-between gap-2">
                  {promoP && (
                    <div className="flex items-baseline gap-1.5">
                      {origP && (
                        <span className="line-through opacity-50"
                          style={{ fontSize: `${Math.max(10, (promo.priceSize || 24) - 8)}px` }}>
                          {origP}€
                        </span>
                      )}
                      <span className="font-black leading-none"
                        style={{
                          fontSize: `${promo.priceSize || 24}px`,
                          textShadow: isImageBg ? '0 2px 12px rgba(0,0,0,0.5)' : 'none',
                        }}>
                        {promoP}€
                      </span>
                    </div>
                  )}
                  {tr?.ctaUrl && tr?.cta && (
                    <a href={tr.ctaUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all hover:scale-105"
                      style={{
                        fontSize: `${promo.ctaSize || 12}px`,
                        background: 'rgba(255,255,255,0.22)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                      }}>
                      {tr.cta}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>

                {promo.availFrom && promo.availTo && (
                  <p className="text-[10px] opacity-60 mt-1.5 flex items-center gap-1">
                    <span>🕐</span>
                    <span>{(AVAIL_LABEL[locale] || AVAIL_LABEL.fr)(promo.availFrom, promo.availTo)}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
