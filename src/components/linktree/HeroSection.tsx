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
  videoUrl?: string | null;
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

// ── Progress Bar ─────────────────────────────────────────
function ProgressDots({
  total, current, paused, delay, accentColor, onGo, onTogglePause,
}: {
  total: number; current: number; paused: boolean; delay: number;
  accentColor: string; onGo: (i: number) => void; onTogglePause: () => void;
}) {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 z-20">
      {/* Pause / Play */}
      <button
        onClick={onTogglePause}
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
        style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
        aria-label={paused ? 'Play' : 'Pause'}
      >
        {paused
          ? <Play className="w-3.5 h-3.5 text-white" fill="white" />
          : <Pause className="w-3.5 h-3.5 text-white" fill="white" />}
      </button>

      {/* Indicators */}
      <div className="flex items-center gap-1.5 flex-1">
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === current;
          return (
            <button
              key={i}
              onClick={() => onGo(i)}
              className="relative flex-shrink-0 rounded-full overflow-hidden transition-all duration-300"
              style={{
                width: isActive ? '52px' : '6px',
                height: '6px',
                background: 'rgba(255,255,255,0.35)',
              }}
              aria-label={`Slide ${i + 1}`}
            >
              {isActive && (
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    backgroundColor: accentColor,
                    animation: paused ? 'none' : `hero-progress ${delay}ms linear forwards`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function HeroSection({ settings, slides, featureCards, locale }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const total = slides.length;
  const delay = settings.autoplayDelay || 5000;

  // Touch / drag refs
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback((idx: number) => {
    if (total === 0) return;
    setCurrent(((idx % total) + total) % total);
    setAnimKey(k => k + 1);
  }, [total]);

  const prev = useCallback(() => go(current - 1), [current, go]);
  const next = useCallback(() => go(current + 1), [current, go]);

  // Autoplay with progress reset
  useEffect(() => {
    if (!settings.autoplay || total <= 1 || paused) return;
    const timer = setInterval(() => {
      setCurrent(c => ((c + 1) % total));
      setAnimKey(k => k + 1);
    }, delay);
    return () => clearInterval(timer);
  }, [settings.autoplay, delay, total, paused]);

  // ── Touch handlers ────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) next(); else prev();
  }, [next, prev]);

  // ── Mouse drag handlers ───────────────────────────────
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
    if (delta < 0) next(); else prev();
  }, [next, prev]);

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
    <section className="w-full pb-4">
      {/* ── Hero Card ── */}
      <div
        ref={containerRef}
        className="relative w-full rounded-3xl overflow-hidden select-none"
        style={{ ...slideBg(slide), cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {/* Background video */}
        {slide.videoUrl && (
          <div className="absolute inset-0 hero-anim-overlay" key={`vid-${current}`}>
            <video
              src={slide.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.60) 45%, rgba(0,0,0,0.20) 100%)' }} />
          </div>
        )}

        {/* Background image */}
        {!slide.videoUrl && slide.imageUrl && (
          <div className="absolute inset-0 hero-anim-overlay" key={`img-${current}`}>
            <Image
              src={slide.imageUrl}
              alt=""
              fill
              priority={current === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
              className="object-cover pointer-events-none"
              draggable={false}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.60) 45%, rgba(0,0,0,0.20) 100%)' }} />
          </div>
        )}

        {/* ── Content ── */}
        <div
          key={animKey}
          className="relative z-10 flex flex-col justify-end min-h-[340px] md:min-h-[420px] p-6 pb-16 md:p-10 md:pb-20"
        >
          {/* Badges */}
          {badges.length > 0 && (
            <div className="hero-anim-0 flex flex-wrap gap-2 mb-4">
              {badges.map((badge, i) => {
                const text = badge[locale as keyof typeof badge] || badge.fr || '';
                if (!text) return null;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: `${settings.accentColor}25`, border: `1px solid ${settings.accentColor}50` }}
                  >
                    <Check className="w-3 h-3 flex-shrink-0" style={{ color: settings.accentColor }} />
                    <span className="text-white text-xs font-semibold tracking-wide">{text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Accent bar */}
          <div className="hero-anim-0 mb-3">
            <span className="h-1 w-10 rounded-full inline-block" style={{ backgroundColor: settings.accentColor }} />
          </div>

          {/* Title — big like O-Tacos */}
          <h2
            className="hero-anim-1 text-white font-black leading-[0.95] tracking-tight mb-3"
            style={{
              fontSize: 'clamp(2.4rem, 8vw, 4.5rem)',
              textShadow: '0 2px 32px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </h2>

          {/* Subtitle */}
          {subtitle && (
            <p className="hero-anim-2 text-white/80 text-base md:text-lg mb-2 leading-relaxed font-medium max-w-lg">
              {subtitle}
            </p>
          )}

          {/* Side text */}
          {sideText && (
            <p className="hero-anim-3 text-white/50 text-sm mb-4 leading-relaxed italic">
              {sideText}
            </p>
          )}

          {/* CTA Buttons */}
          {slide.buttons.length > 0 && (
            <div className="hero-anim-4 flex flex-wrap gap-2 mt-1">
              {slide.buttons.map(btn => (
                <a
                  key={btn.id}
                  href={btn.url}
                  target={btn.url.startsWith('http') ? '_blank' : undefined}
                  rel={btn.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 hover:shadow-lg"
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

        {/* ── Slider Controls ── */}
        {total > 1 && (
          <>
            {/* Arrows */}
            {settings.showArrows && (
              <>
                <button
                  onClick={prev}
                  aria-label="Slide précédent"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={next}
                  aria-label="Slide suivant"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            {/* Progress dots bar */}
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
