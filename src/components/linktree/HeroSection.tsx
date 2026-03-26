'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  ArrowRight, ChevronLeft, ChevronRight, Check, Pause, Play,
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
  mobileImageUrl?: string | null;
  videoUrl?: string | null;
  bgColor: string;
  bgGradient?: string | null;
  bgType: string;
  photoOnly?: boolean;
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

// ── Progress Bar ─────────────────────────────────────────
function ProgressDots({
  total, current, paused, delay, accentColor, onGo, onTogglePause,
}: {
  total: number; current: number; paused: boolean; delay: number;
  accentColor: string; onGo: (i: number) => void; onTogglePause: () => void;
}) {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 z-20">
      <button
        onClick={onTogglePause}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
        aria-label={paused ? 'Play' : 'Pause'}
      >
        {paused
          ? <Play className="w-3.5 h-3.5 text-white" fill="white" />
          : <Pause className="w-3.5 h-3.5 text-white" fill="white" />}
      </button>

      <div className="flex items-center gap-1.5 flex-1">
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === current;
          return (
            <button
              key={i}
              onClick={() => onGo(i)}
              className="relative flex-shrink-0 flex items-center justify-center transition-all duration-300"
              style={{
                width: isActive ? '52px' : '6px',
                minWidth: '44px',
                minHeight: '44px',
                background: 'transparent',
                padding: 0,
              }}
              aria-label={`Slide ${i + 1}`}
            >
              <span
                className="rounded-full overflow-hidden transition-all duration-300"
                style={{
                  width: '100%',
                  height: '4px',
                  background: 'rgba(255,255,255,0.3)',
                  display: 'block',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <span
                    className="absolute inset-y-0 left-0 right-0 rounded-full"
                    style={{
                      backgroundColor: accentColor,
                      transformOrigin: 'left center',
                      animation: paused ? 'none' : `hero-progress ${delay}ms linear forwards`,
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slide counter */}
      <span className="text-xs font-bold text-white/70 flex-shrink-0 tabular-nums">
        {current + 1}<span className="text-white/40">/{total}</span>
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function HeroSection({ settings, slides, featureCards, locale }: Props) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const total = slides.length;
  const delay = settings.autoplayDelay || 5000;

  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback((idx: number) => {
    if (total === 0) return;
    const next = ((idx % total) + total) % total;
    setPrev(current);
    setCurrent(next);
    setAnimKey(k => k + 1);
  }, [current, total]);

  const goPrev = useCallback(() => go(current - 1), [current, go]);
  const goNext = useCallback(() => go(current + 1), [current, go]);

  useEffect(() => {
    if (!settings.autoplay || total <= 1 || paused) return;
    const timer = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % total;
        setPrev(c);
        setAnimKey(k => k + 1);
        return next;
      });
    }, delay);
    return () => clearInterval(timer);
  }, [settings.autoplay, delay, total, paused]);

  // Clear prev after transition
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 700);
    return () => clearTimeout(t);
  }, [prev, current]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) goNext(); else goPrev();
  }, [goNext, goPrev]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    isDragging.current = false;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    if (Math.abs(e.clientX - dragStartX.current) > 8) isDragging.current = true;
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (!isDragging.current || Math.abs(delta) < 40) { isDragging.current = false; return; }
    isDragging.current = false;
    if (delta < 0) goNext(); else goPrev();
  }, [goNext, goPrev]);

  const onMouseLeave = useCallback(() => {
    dragStartX.current = null;
    isDragging.current = false;
  }, []);

  if (!settings.isVisible || total === 0) return null;

  const slide = slides[current];
  const title = t(slide.titleJson, locale);
  const subtitle = t(slide.subtitleJson, locale);
  const sideText = t(slide.sideTextJson, locale);

  let badges: { fr?: string; en?: string; it?: string; es?: string }[] = [];
  try { if (slide.badgesJson) badges = JSON.parse(slide.badgesJson); } catch { /* noop */ }

  return (
    <section className="w-full">
      {/* ── Hero Card — full-bleed mobile, rounded on desktop ── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none"
        style={{ ...slideBg(slide), cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {/* ── Photo-only mode ── */}
        {slide.photoOnly ? (
          <>
            {slide.imageUrl && (
              <div
                key={`photo-desk-${current}-${animKey}`}
                className={`absolute inset-0 hero-anim-overlay${slide.mobileImageUrl ? ' hidden md:block' : ''}`}
              >
                <Image src={slide.imageUrl} alt="" fill priority
                  sizes="(max-width: 1280px) 100vw, 1400px" quality={75}
                  className="object-cover object-center pointer-events-none"
                  draggable={false}
                />
              </div>
            )}
            {slide.mobileImageUrl && (
              <div key={`photo-mob-${current}-${animKey}`} className="absolute inset-0 hero-anim-overlay md:hidden">
                <Image src={slide.mobileImageUrl} alt="" fill priority
                  sizes="100vw" quality={75}
                  className="object-cover object-center pointer-events-none"
                  draggable={false}
                />
              </div>
            )}
            <div className="min-h-[56vw] md:min-h-[500px]" style={{ minHeight: 'min(60vh, 680px)' }} />
          </>
        ) : (
          <>
            {/* Prev slide fading out */}
            {prev !== null && slides[prev] && (
              <div key={`prev-${prev}`} className="absolute inset-0 hero-anim-out" style={{ zIndex: 1 }}>
                {slides[prev].videoUrl ? (
                  <video src={slides[prev].videoUrl!} autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none" />
                ) : slides[prev].imageUrl ? (
                  <Image src={slides[prev].imageUrl!} alt="" fill sizes="100vw" quality={55} className="object-cover pointer-events-none" draggable={false} />
                ) : null}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(170deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.92) 100%)' }} />
              </div>
            )}

            {/* Current slide */}
            <div key={`curr-${current}-${animKey}`} className="absolute inset-0 hero-anim-overlay" style={{ zIndex: 2 }}>
              {slide.videoUrl ? (
                <>
                  <video src={slide.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(170deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.92) 100%)' }} />
                </>
              ) : slide.imageUrl ? (
                <>
                  <Image src={slide.imageUrl} alt="" fill priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1400px"
                    quality={72} className="object-cover pointer-events-none" draggable={false}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(170deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.90) 100%)' }} />
                </>
              ) : (
                <div className="absolute inset-0" style={slideBg(slide)} />
              )}
            </div>

            {/* ── Content ── */}
            <div
              key={animKey}
              className="relative flex flex-col justify-end p-5 pb-20 md:p-10 md:pb-24"
              style={{ minHeight: 'min(62vh, 680px)', zIndex: 10 }}
            >
              {/* Accent line */}
              <div className="hero-anim-0 mb-3">
                <span className="h-[3px] w-8 rounded-full inline-block" style={{ backgroundColor: settings.accentColor }} />
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="hero-anim-0 flex flex-wrap gap-2 mb-3">
                  {badges.map((badge, i) => {
                    const text = badge[locale as keyof typeof badge] || badge.fr || '';
                    if (!text) return null;
                    return (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                        style={{ background: `${settings.accentColor}25`, border: `1px solid ${settings.accentColor}50` }}>
                        <Check className="w-3 h-3 flex-shrink-0" style={{ color: settings.accentColor }} />
                        <span className="text-white text-xs font-semibold tracking-wide">{text}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Title */}
              <h1
                className="hero-anim-1 text-white font-black leading-[0.92] tracking-tight mb-3"
                style={{
                  fontSize: 'clamp(2.6rem, 9vw, 5rem)',
                  textShadow: '0 2px 40px rgba(0,0,0,0.6)',
                }}
              >
                {title}
              </h1>

              {/* Subtitle */}
              {subtitle && (
                <p className="hero-anim-2 text-white/75 text-sm md:text-base mb-3 leading-relaxed font-medium max-w-lg">
                  {subtitle}
                </p>
              )}

              {/* Side text */}
              {sideText && (
                <p className="hero-anim-3 text-white/45 text-sm mb-3 leading-relaxed italic">
                  {sideText}
                </p>
              )}

              {/* CTA Buttons */}
              {slide.buttons.length > 0 && (
                <div className="hero-anim-4 flex flex-wrap gap-2.5 mt-1">
                  {slide.buttons.map(btn => (
                    <a
                      key={btn.id}
                      href={btn.url}
                      target={btn.url.startsWith('http') ? '_blank' : undefined}
                      rel={btn.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 hover:shadow-xl"
                      style={btnBg(btn)}
                      onClick={e => { if (isDragging.current) e.preventDefault(); }}
                    >
                      {btn.icon && <SlideIcon icon={btn.icon} color={btn.textColor} size={16} />}
                      {t(btn.labelJson, locale, 'Button')}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Slider Controls ── */}
        {total > 1 && (
          <>
            {settings.showArrows && (
              <>
                <button onClick={goPrev} aria-label="Slide précédent"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20"
                  style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button onClick={goNext} aria-label="Slide suivant"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20"
                  style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            {settings.showDots && (
              <ProgressDots
                key={animKey}
                total={total}
                current={current}
                paused={paused}
                delay={delay}
                accentColor={settings.accentColor}
                onGo={go}
                onTogglePause={() => setPaused(p => !p)}
              />
            )}
          </>
        )}
      </div>

      {/* ── Feature Cards — horizontal scroll on mobile ── */}
      {settings.showFeatureCards && featureCards.length > 0 && (
        <div
          className="flex gap-3 mt-3 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            gridTemplateColumns: `repeat(${Math.min(featureCards.length, 3)}, 1fr)`,
          }}
        >
          {featureCards.map(card => {
            const cardTitle = t(card.titleJson, locale);
            const Inner = (
              <div
                className="relative flex flex-col justify-between p-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer overflow-hidden flex-shrink-0 md:flex-shrink"
                style={{
                  backgroundColor: card.bgColor,
                  scrollSnapAlign: 'start',
                  minWidth: '140px',
                  minHeight: '110px',
                  width: 'calc(45vw)',
                  maxWidth: '200px',
                }}
              >
                <p className="font-black text-sm leading-snug" style={{ color: card.textColor }}>
                  {cardTitle}
                </p>
                <div className="flex items-end justify-between mt-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${card.iconColor}18` }}>
                    <SlideIcon icon={card.icon} color={card.iconColor} size={20} />
                  </div>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: `${card.arrowColor}20` }}>
                    <ArrowRight className="w-3.5 h-3.5" style={{ color: card.arrowColor }} />
                  </div>
                </div>
              </div>
            );
            if (card.url) return (
              <a key={card.id} href={card.url}
                target={card.url.startsWith('http') ? '_blank' : undefined}
                rel={card.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{ scrollSnapAlign: 'start' }}>
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
