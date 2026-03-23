'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  ArrowRight, ChevronLeft, ChevronRight, Star, Check,
  Truck, Salad, Percent, Tag, Gift, ShoppingCart, ShoppingBag,
  UtensilsCrossed, MapPin, Phone, Clock, Globe, Instagram,
  Bike, Pizza, Coffee, Flame, Leaf, Zap, Award, Sparkles,
  BookOpen, Heart, Ticket, MessageCircle, Send, Camera,
  Fish, Beef, Navigation, Home,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ────────────────────────────────────────────────
interface SlideButton {
  id: number;
  labelJson: string;
  url: string;
  icon?: string | null;
  bgColor: string;
  bgGradient?: string | null;
  bgType: string;
  textColor: string;
  style: string;
  sortOrder: number;
}

interface Slide {
  id: number;
  titleJson: string;
  subtitleJson?: string | null;
  badgesJson?: string | null;
  sideTextJson?: string | null;
  imageUrl?: string | null;
  bgColor: string;
  bgGradient?: string | null;
  bgType: string;
  buttons: SlideButton[];
}

interface FeatureCard {
  id: number;
  titleJson: string;
  icon: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
  arrowColor: string;
  url?: string | null;
}

interface HeroSettings {
  isVisible: boolean;
  autoplay: boolean;
  autoplayDelay: number;
  showDots: boolean;
  showArrows: boolean;
  ratingCount: string;
  ratingTextJson?: string | null;
  showRating: boolean;
  showFeatureCards: boolean;
  accentColor: string;
}

interface Props {
  settings: HeroSettings;
  slides: Slide[];
  featureCards: FeatureCard[];
  locale: string;
}

// ── Helpers ──────────────────────────────────────────────
function t(json: string | null | undefined, locale: string, fallback = ''): string {
  if (!json) return fallback;
  try {
    const obj = JSON.parse(json);
    return obj[locale] || obj['fr'] || fallback;
  } catch {
    return fallback;
  }
}

const ICON_MAP: Record<string, LucideIcon> = {
  truck: Truck, delivery: Truck, bike: Bike, car: Truck,
  salad: Salad, food: UtensilsCrossed, utensils: UtensilsCrossed,
  percent: Percent, tag: Tag, gift: Gift, ticket: Ticket,
  'shopping-cart': ShoppingCart, 'shopping-bag': ShoppingBag,
  menu: BookOpen, pizza: Pizza, coffee: Coffee, flame: Flame, leaf: Leaf,
  vegan: Leaf, zap: Zap, 'map-pin': MapPin, map: MapPin, phone: Phone,
  clock: Clock, globe: Globe, instagram: Instagram, heart: Heart,
  fish: Fish, beef: Beef, navigation: Navigation, home: Home,
  camera: Camera, message: MessageCircle, telegram: Send,
  award: Award, sparkles: Sparkles,
};

function SlideIcon({ icon, color, size = 20 }: { icon?: string | null; color: string; size?: number }) {
  if (!icon) return null;
  const Icon = ICON_MAP[icon.toLowerCase()];
  if (!Icon) return null;
  return <Icon style={{ color, width: size, height: size }} />;
}

function btnBg(btn: SlideButton): React.CSSProperties {
  if (btn.style === 'outline') return {
    background: 'transparent',
    border: `2px solid ${btn.bgColor}`,
    color: btn.textColor,
  };
  if (btn.style === 'ghost') return {
    background: `${btn.bgColor}22`,
    color: btn.textColor,
    border: `1px solid ${btn.bgColor}44`,
  };
  return { background: btn.bgGradient || btn.bgColor, color: btn.textColor };
}

function slideBg(slide: Slide): React.CSSProperties {
  if (slide.bgType === 'gradient' && slide.bgGradient) return { background: slide.bgGradient };
  return { backgroundColor: slide.bgColor };
}

// ── Avatar Stack (rating display) ────────────────────────
const AVATAR_COLORS = ['#F59E0B', '#EF4444', '#10B981'];
function AvatarStack() {
  return (
    <div className="flex -space-x-2">
      {AVATAR_COLORS.map((color, i) => (
        <div key={i} className="w-7 h-7 rounded-full border-2 border-white/20 flex items-center justify-center text-white font-black text-[10px]"
          style={{ background: color, zIndex: 3 - i }}>
          {['A', 'B', 'C'][i]}
        </div>
      ))}
    </div>
  );
}

// ── Star Rating ───────────────────────────────────────────
function StarRow({ count = 5, color }: { count?: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-current" style={{ color }} />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function HeroSection({ settings, slides, featureCards, locale }: Props) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const total = slides.length;

  const go = useCallback((idx: number) => {
    if (isAnimating || total === 0) return;
    setIsAnimating(true);
    setCurrent(((idx % total) + total) % total);
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating, total]);

  const prev = useCallback(() => go(current - 1), [current, go]);
  const next = useCallback(() => go(current + 1), [current, go]);

  useEffect(() => {
    if (!settings.autoplay || total <= 1) return;
    const timer = setInterval(next, settings.autoplayDelay || 5000);
    return () => clearInterval(timer);
  }, [settings.autoplay, settings.autoplayDelay, next, total]);

  if (!settings.isVisible || total === 0) return null;

  const slide = slides[current];
  const title = t(slide.titleJson, locale);
  const subtitle = t(slide.subtitleJson, locale);
  const sideText = t(slide.sideTextJson, locale);
  const ratingText = t(settings.ratingTextJson, locale, 'Rating');

  let badges: { fr?: string; en?: string; it?: string; es?: string }[] = [];
  try { if (slide.badgesJson) badges = JSON.parse(slide.badgesJson); } catch { /* noop */ }

  return (
    <section className="w-full pb-4">
      {/* ── Hero Card ── */}
      <div
        className="relative w-full rounded-3xl overflow-hidden transition-colors duration-500"
        style={slideBg(slide)}
      >
        {/* Background image */}
        {slide.bgType === 'image' && slide.imageUrl && (
          <div className="absolute inset-0">
            <Image src={slide.imageUrl} alt="" fill className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row md:items-stretch min-h-[280px] md:min-h-[320px]">
          {/* ── Left content ── */}
          <div className="flex-1 p-5 md:p-8 flex flex-col justify-between">
            {/* Top: rating on mobile hides, shown separately on desktop */}
            <div>
              {/* Rating - visible on mobile too at top */}
              {settings.showRating && (
                <div className="flex items-center gap-2 mb-4 md:hidden">
                  <AvatarStack />
                  <div>
                    <p className="text-white font-black text-sm leading-none">{settings.ratingCount}</p>
                    <StarRow color={settings.accentColor} />
                  </div>
                  <span className="text-white/60 text-xs ml-1">{ratingText}</span>
                </div>
              )}

              {/* Title */}
              <h2 className="text-white font-black text-2xl md:text-4xl leading-tight mb-3 max-w-xs md:max-w-sm">
                {title}
              </h2>

              {/* Subtitle */}
              {subtitle && (
                <p className="text-white/70 text-sm md:text-base mb-4 max-w-xs">{subtitle}</p>
              )}

              {/* CTA Buttons */}
              {slide.buttons.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {slide.buttons.map(btn => (
                    <a
                      key={btn.id}
                      href={btn.url}
                      target={btn.url.startsWith('http') ? '_blank' : undefined}
                      rel={btn.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 hover:shadow-lg"
                      style={btnBg(btn)}
                    >
                      {btn.icon && <SlideIcon icon={btn.icon} color={btn.textColor} size={16} />}
                      {t(btn.labelJson, locale, 'Button')}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {badges.map((badge, i) => {
                  const text = badge[locale as keyof typeof badge] || badge.fr || '';
                  if (!text) return null;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${settings.accentColor}30` }}>
                        <Check className="w-3 h-3" style={{ color: settings.accentColor }} />
                      </div>
                      <span className="text-white/80 text-xs font-medium">{text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right content ── */}
          <div className="relative hidden md:flex flex-col items-end justify-between p-8 min-w-[280px]">
            {/* Rating */}
            {settings.showRating && (
              <div className="flex items-center gap-2 self-end">
                <AvatarStack />
                <div className="text-right">
                  <p className="text-white font-black text-sm leading-none">{settings.ratingCount}</p>
                  <StarRow color={settings.accentColor} />
                </div>
                <span className="text-white/60 text-xs">{ratingText}</span>
              </div>
            )}

            {/* Food image */}
            {slide.imageUrl && slide.bgType !== 'image' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-48 h-48 md:w-56 md:h-56">
                  <div className="absolute inset-0 rounded-full opacity-30 blur-2xl"
                    style={{ background: settings.accentColor }} />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/10"
                    style={{ background: `${settings.accentColor}25` }}>
                    <Image src={slide.imageUrl} alt={title} fill className="object-cover" />
                  </div>
                </div>
              </div>
            )}

            {/* Side text */}
            {sideText && (
              <p className="text-white/50 text-xs italic text-right max-w-[160px] leading-relaxed self-end">
                {sideText}
              </p>
            )}
          </div>
        </div>

        {/* ── Slider Controls ── */}
        {total > 1 && (
          <>
            {/* Arrows */}
            {settings.showArrows && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}
            {/* Dots */}
            {settings.showDots && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => go(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === current ? '20px' : '6px',
                      height: '6px',
                      background: i === current ? settings.accentColor : 'rgba(255,255,255,0.4)',
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Feature Cards ── */}
      {settings.showFeatureCards && featureCards.length > 0 && (
        <div className="grid gap-3 mt-3" style={{ gridTemplateColumns: `repeat(${Math.min(featureCards.length, 3)}, 1fr)` }}>
          {featureCards.map(card => {
            const cardTitle = t(card.titleJson, locale);
            const Inner = (
              <div
                className="relative flex flex-col justify-between p-4 rounded-2xl min-h-[110px] md:min-h-[130px] transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer overflow-hidden"
                style={{ backgroundColor: card.bgColor }}
              >
                <div>
                  <p className="font-black text-sm md:text-base leading-snug" style={{ color: card.textColor }}>
                    {cardTitle}
                  </p>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${card.iconColor}15` }}>
                    <SlideIcon icon={card.icon} color={card.iconColor} size={22} />
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: `${card.arrowColor}20` }}>
                    <ArrowRight className="w-4 h-4" style={{ color: card.arrowColor }} />
                  </div>
                </div>
              </div>
            );
            if (card.url) return (
              <a key={card.id} href={card.url} target={card.url.startsWith('http') ? '_blank' : undefined}
                rel={card.url.startsWith('http') ? 'noopener noreferrer' : undefined}>
                {Inner}
              </a>
            );
            return <div key={card.id}>{Inner}</div>;
          })}
        </div>
      )}
    </section>
  );
}
