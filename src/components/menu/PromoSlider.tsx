'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { autoTextColor } from '@/lib/color';

interface Props {
  promos: any[];
  locale: string;
  primaryColor: string;
}

const AVAIL_LABEL: Record<string, (from: string, to: string) => string> = {
  fr: (f, t) => `Disponible uniquement de ${f} à ${t}`,
  en: (f, t) => `Available only from ${f} to ${t}`,
  it: (f, t) => `Disponibile solo dalle ${f} alle ${t}`,
  es: (f, t) => `Disponible solo de ${f} a ${t}`,
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const [activePromos, setActivePromos] = useState<any[]>(promos);
  const [promoDays, setPromoDays] = useState<Record<number, number | null>>({});

  useEffect(() => {
    const filtered = promos.filter(isPromoActive);
    setActivePromos(filtered);
    const days: Record<number, number | null> = {};
    filtered.forEach(p => { days[p.id] = daysUntilExpiry(p.endsAt); });
    setPromoDays(days);
  }, [promos]);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  // useEffect + rAF: defers geometric reads until after paint, avoids forced reflow
  useEffect(() => {
    const raf = requestAnimationFrame(updateArrows);
    return () => cancelAnimationFrame(raf);
  }, [activePromos]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    // Mouse wheel → horizontal scroll
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY * 2.5, behavior: 'auto' });
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('scroll', updateArrows);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', updateArrows);
    };
  }, [activePromos]);

  function scroll(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  }

  if (activePromos.length === 0) return null;

  const expiryFn = EXPIRY_LABELS[locale] || EXPIRY_LABELS.fr;

  return (
    <div className="relative">
      {/* Left arrow — inside container bounds */}
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          aria-label="Promotion précédente"
          className="absolute left-1 top-1/2 -translate-y-4 z-20 w-9 h-9 rounded-full bg-white/95 shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {/* Right arrow — inside container bounds */}
      {canRight && (
        <button
          onClick={() => scroll(1)}
          aria-label="Promotion suivante"
          className="absolute right-1 top-1/2 -translate-y-4 z-20 w-9 h-9 rounded-full bg-white/95 shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}

      {/* Mobile: vertical stack — Desktop: horizontal scroll */}
      <div
        ref={trackRef}
        className="flex flex-col gap-3 sm:flex-row sm:overflow-x-auto sm:pb-2"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {(() => {
          // Index de la première promo qui possède réellement une image de fond.
          // Si le 1er promo est de type couleur/gradient, isFirst=0 ne couvre pas
          // la vraie image LCP — ce calcul garantit fetchpriority=high dessus.
          const firstImgIndex = activePromos.findIndex(
            p => (p.photoOnly && p.bgImageUrl) || (p.bgType === 'image' && p.bgImageUrl)
          );

          return activePromos.map((promo, i) => {
          const t = promo.translations?.[0];
          const days = promoDays[promo.id] ?? null;
          const showExpiry = days !== null && days <= 6 && days >= 0;
          const promoP = safePrice(promo.promoPrice);
          const origP = safePrice(promo.originalPrice);
          const isPriority = i === firstImgIndex;

          if (promo.photoOnly && promo.bgImageUrl) {
            return (
              <div key={promo.id} className="relative w-full sm:flex-shrink-0 sm:w-72 md:w-64 xl:w-72 rounded-2xl overflow-hidden"
                style={{ height: '160px', scrollSnapAlign: 'start' }}>
                <Image src={promo.bgImageUrl} alt={t?.title || ''} fill sizes="(max-width: 640px) 80vw, (max-width: 768px) 288px, (max-width: 1280px) 256px, 288px" quality={65} priority={isPriority} className="object-cover" />
              </div>
            );
          }

          const isImageBg = promo.bgType === 'image' && promo.bgImageUrl;
          const bgStyle = isImageBg
            ? {}
            : promo.bgType === 'gradient' && promo.bgGradient
            ? { background: promo.bgGradient }
            : { backgroundColor: promo.bgColor };

          return (
            <div key={promo.id} className="w-full sm:flex-shrink-0 sm:w-72 md:w-64 xl:w-72 rounded-2xl overflow-hidden relative"
              style={{ ...bgStyle, height: '160px', scrollSnapAlign: 'start' }}>

              {isImageBg && (
                <>
                  <Image src={promo.bgImageUrl} alt="" fill sizes="(max-width: 640px) 80vw, (max-width: 768px) 288px, (max-width: 1280px) 256px, 288px" quality={65} priority={isPriority} className="object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                </>
              )}

              {showExpiry && (
                <div className="absolute top-0 right-0 z-20">
                  <div className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg tracking-wide uppercase">
                    {expiryFn(days!)}
                  </div>
                </div>
              )}

              <div className="relative z-10 p-4 h-full flex flex-col justify-between" style={{ color: promo.textColor }}>
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(() => { try { const b = JSON.parse(promo.badgeText || '{}'); return b[locale] || b.fr || null; } catch { return promo.badgeText || null; } })() && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                        style={{ backgroundColor: promo.badgeColor, color: autoTextColor(promo.badgeColor) }}>
                        {(() => { try { const b = JSON.parse(promo.badgeText || '{}'); return b[locale] || b.fr || promo.badgeText; } catch { return promo.badgeText; } })()}
                      </span>
                    )}
                  </div>
                  {t?.title && <p className="font-bold text-base leading-snug">{t.title}</p>}
                  {t?.description && <p className="text-xs opacity-80 mt-1 line-clamp-2">{t.description}</p>}
                </div>

                <div className="flex items-end justify-between mt-3 gap-2">
                  {promoP && (
                    <div className="flex items-baseline gap-1.5">
                      {origP && <span className="text-xs line-through opacity-50">{origP}€</span>}
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

                {promo.availFrom && promo.availTo && (
                  <p className="text-[10px] opacity-70 mt-2 leading-snug flex items-start gap-1">
                    <span>🕐</span>
                    <span>{(AVAIL_LABEL[locale] || AVAIL_LABEL.fr)(promo.availFrom, promo.availTo)}</span>
                  </p>
                )}
              </div>
            </div>
          );
        });
        })()}
      </div>
    </div>
  );
}
