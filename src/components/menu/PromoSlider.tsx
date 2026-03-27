'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { autoTextColor } from '@/lib/color';

interface Props {
  promos: any[];
  locale: string;
  primaryColor: string;
  onActiveCount?: (n: number) => void;
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
  end.setHours(23, 59, 59, 999);
  return Math.floor((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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

function getBestTranslation(promo: any, locale: string) {
  if (!promo.translations?.length) return null;
  return (
    promo.translations.find((t: any) => t.locale === locale) ||
    promo.translations.find((t: any) => t.locale === 'fr') ||
    promo.translations[0]
  );
}

export default function PromoSlider({ promos, locale, primaryColor, onActiveCount }: Props) {
  const [activePromos, setActivePromos] = useState<any[]>([]);
  const [promoDays, setPromoDays] = useState<Record<number, number | null>>({});

  const filterPromos = useCallback(() => {
    const filtered = promos.filter(isPromoActive);
    setActivePromos(filtered);
    const days: Record<number, number | null> = {};
    filtered.forEach(p => { days[p.id] = daysUntilExpiry(p.endsAt); });
    setPromoDays(days);
    onActiveCount?.(filtered.length);
  }, [promos, onActiveCount]);

  useEffect(() => { filterPromos(); }, [filterPromos]);

  if (activePromos.length === 0) return null;

  const expiryFn = EXPIRY_LABELS[locale] || EXPIRY_LABELS.fr;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {activePromos.map((promo, i) => {
        const tr = getBestTranslation(promo, locale);
        const days = promoDays[promo.id] ?? null;
        const showExpiry = days !== null && days <= 6 && days >= 0;
        const promoP = safePrice(promo.promoPrice);
        const origP = safePrice(promo.originalPrice);
        const isPriority = i < 3;

        const isImageBg = promo.bgType === 'image' && promo.bgImageUrl;
        const solidBgStyle = isImageBg
          ? undefined
          : promo.bgType === 'gradient' && promo.bgGradient
          ? { background: promo.bgGradient }
          : { backgroundColor: promo.bgColor || '#F59E0B' };

        const badgeText = (() => {
          try {
            const b = JSON.parse(promo.badgeText || '{}');
            return (typeof b === 'object' && b !== null)
              ? (b[locale] || b.fr || null)
              : promo.badgeText || null;
          } catch {
            return promo.badgeText || null;
          }
        })();

        const discountPct =
          promoP && origP
            ? Math.round((1 - parseFloat(promoP) / parseFloat(origP)) * 100)
            : null;

        // ── Photo-only card ──
        if (promo.photoOnly && promo.bgImageUrl) {
          return (
            <div
              key={promo.id}
              className="relative w-full rounded-2xl overflow-hidden aspect-[3/4] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Image
                src={promo.bgImageUrl}
                alt={tr?.title || ''}
                fill
                sizes="(max-width: 640px) 50vw, 260px"
                quality={85}
                priority={isPriority}
                className="object-cover"
              />
            </div>
          );
        }

        // ── Split card: image top + text bottom ──
        return (
          <div
            key={promo.id}
            className="group relative w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
          >
            {/* ── TOP: image or color area ── */}
            <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
              {isImageBg ? (
                <>
                  <Image
                    src={promo.bgImageUrl}
                    alt={tr?.title || ''}
                    fill
                    sizes="(max-width: 640px) 50vw, 260px"
                    quality={85}
                    priority={isPriority}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle gradient only at bottom of image for badge readability */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.45) 100%)',
                    }}
                  />
                </>
              ) : (
                <div className="w-full h-full relative overflow-hidden" style={solidBgStyle}>
                  {/* Decorative circles */}
                  <div
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  />
                  <div
                    className="absolute top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  />
                  <div
                    className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
                    style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                  />
                </div>
              )}

              {/* Badge — top left */}
              {badgeText && (
                <span
                  className="absolute top-2 left-2 z-10 font-black uppercase tracking-wide leading-none px-2 py-1 rounded shadow-sm"
                  style={{
                    backgroundColor: promo.badgeColor || 'rgba(0,0,0,0.72)',
                    color: promo.badgeColor
                      ? autoTextColor(promo.badgeColor)
                      : '#ffffff',
                    fontSize: `clamp(8px, 2vw, ${promo.badgeSize || 10}px)`,
                    backdropFilter: !promo.badgeColor ? 'blur(4px)' : undefined,
                  }}
                >
                  {badgeText}
                </span>
              )}

              {/* Expiry / discount — top right */}
              <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
                {showExpiry && (
                  <span
                    className="bg-red-500 text-white font-black rounded leading-none tracking-wide uppercase shadow px-1.5 py-1"
                    style={{ fontSize: 'clamp(7px, 1.6vw, 9px)' }}
                  >
                    {expiryFn(days!)}
                  </span>
                )}
                {discountPct !== null && discountPct > 0 && (
                  <span
                    className="font-black rounded leading-none shadow px-1.5 py-1"
                    style={{
                      fontSize: 'clamp(7px, 1.6vw, 9px)',
                      backgroundColor: '#22c55e',
                      color: '#052e16',
                    }}
                  >
                    -{discountPct}%
                  </span>
                )}
              </div>

              {/* Availability overlay at bottom of image */}
              {promo.availFrom && promo.availTo && (
                <p
                  className="absolute bottom-1.5 right-2 z-10 hidden sm:flex items-center gap-1 text-white/80"
                  style={{ fontSize: '9px' }}
                >
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                  </svg>
                  {(AVAIL_LABEL[locale] || AVAIL_LABEL.fr)(promo.availFrom, promo.availTo)}
                </p>
              )}
            </div>

            {/* ── BOTTOM: text section ── */}
            <div className="flex-1 p-2.5 sm:p-3 bg-white flex flex-col justify-between gap-1">
              <div>
                {tr?.title && (
                  <p
                    className="font-black text-gray-900 leading-tight line-clamp-3"
                    style={{ fontSize: `clamp(11px, 2.6vw, ${promo.titleSize || 13}px)` }}
                  >
                    {tr.title}
                  </p>
                )}

                {tr?.description && (
                  <p
                    className="leading-snug line-clamp-2 mt-0.5"
                    style={{
                      fontSize: `clamp(9px, 2vw, ${promo.descSize || 11}px)`,
                      color: primaryColor,
                    }}
                  >
                    {tr.description}
                  </p>
                )}
              </div>

              {/* Price */}
              {promoP && (
                <div className="flex items-baseline gap-1.5 mt-1">
                  {origP && (
                    <span
                      className="line-through text-gray-400"
                      style={{ fontSize: `clamp(9px, 2vw, ${Math.max(10, (promo.priceSize || 18) - 6)}px)` }}
                    >
                      {origP}€
                    </span>
                  )}
                  <span
                    className="font-black text-gray-900 leading-none"
                    style={{ fontSize: `clamp(13px, 3.5vw, ${promo.priceSize || 18}px)` }}
                  >
                    {promoP}€
                  </span>
                </div>
              )}

              {/* CTA */}
              {tr?.ctaUrl && tr?.cta && (
                <a
                  href={tr.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-full font-black text-xs transition-all hover:scale-105 hover:shadow active:scale-95 self-start"
                  style={{
                    backgroundColor: primaryColor,
                    color: autoTextColor(primaryColor),
                    fontSize: `${promo.ctaSize || 10}px`,
                  }}
                >
                  {tr.cta}
                  <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
