'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface NotificationBannerData {
  id: number;
  isVisible: boolean;
  bgColor: string;
  textColor: string;
  icon?: string | null;
  link?: string | null;
  linkLabel?: string | null;
  priority: number;
  displayDuration: number; // ms
  animType: string;        // slide | fade | bounce
  type: string;            // custom | closed | open
  scheduleEnabled: boolean;
  scheduleStart?: string | null; // "12:00"
  scheduleEnd?: string | null;   // "14:00"
  scheduleDays: string;          // JSON "[0,1,2,3,4,5,6]" — 0=Mon
  sortOrder: number;
  translations: { locale: string; text: string }[];
}

export interface OpeningHoursData {
  dayOfWeek: number; // 0=Mon…6=Sun (schema convention)
  isOpen: boolean;
  slots: string; // JSON [{"open":"11:30","close":"14:30"}]
}

interface Props {
  banners: NotificationBannerData[];
  openingHours?: OpeningHoursData[];
  locale: string;
}

// Legacy single-bar props (backward compat for linktree)
interface LegacyProps {
  bar: {
    isVisible?: boolean;
    bgColor: string;
    textColor: string;
    icon?: string | null;
    link?: string | null;
    linkLabel?: string | null;
    translations: { locale: string; text: string }[];
  };
  locale: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function schemaDay(jsDay: number): number {
  // JS: 0=Sun…6=Sat → Schema: 0=Mon…6=Sun
  return (jsDay + 6) % 7;
}

function getT(translations: { locale: string; text: string }[], locale: string): string {
  return (
    translations.find(x => x.locale === locale && x.text)?.text ||
    translations.find(x => x.locale === 'fr' && x.text)?.text ||
    translations.find(x => x.text)?.text ||
    ''
  );
}

function getActiveBanners(banners: NotificationBannerData[], now: Date): NotificationBannerData[] {
  const day = schemaDay(now.getDay());
  const min = now.getHours() * 60 + now.getMinutes();

  return banners
    .filter(b => {
      if (!b.isVisible) return false;
      if (!b.scheduleEnabled) return true;
      let days: number[] = [];
      try { days = JSON.parse(b.scheduleDays); } catch { days = [0, 1, 2, 3, 4, 5, 6]; }
      if (!days.includes(day)) return false;
      if (b.scheduleStart && b.scheduleEnd) {
        const start = parseHHMM(b.scheduleStart);
        const end = parseHHMM(b.scheduleEnd);
        if (min < start || min >= end) return false;
      }
      return true;
    })
    .sort((a, b) => b.priority - a.priority || a.sortOrder - b.sortOrder);
}

interface RestaurantStatus {
  isOpen: boolean;
  minutesUntilOpen: number | null;
}

function getRestaurantStatus(hours: OpeningHoursData[], now: Date): RestaurantStatus {
  const day = schemaDay(now.getDay());
  const min = now.getHours() * 60 + now.getMinutes();

  const todayHours = hours.find(h => h.dayOfWeek === day);
  if (todayHours?.isOpen) {
    let slots: { open: string; close: string }[] = [];
    try { slots = JSON.parse(todayHours.slots); } catch { slots = []; }
    for (const slot of slots) {
      const o = parseHHMM(slot.open);
      const c = parseHHMM(slot.close);
      if (min >= o && min < c) return { isOpen: true, minutesUntilOpen: null };
    }
    // Check for a later slot today
    for (const slot of slots) {
      const o = parseHHMM(slot.open);
      if (o > min) return { isOpen: false, minutesUntilOpen: o - min };
    }
  }

  // Find next opening across the coming 7 days
  for (let d = 1; d <= 7; d++) {
    const nextDay = (day + d) % 7;
    const nextHours = hours.find(h => h.dayOfWeek === nextDay);
    if (nextHours?.isOpen) {
      let slots: { open: string; close: string }[] = [];
      try { slots = JSON.parse(nextHours.slots); } catch { slots = []; }
      if (slots.length > 0) {
        const firstSlot = slots.sort((a, b) => parseHHMM(a.open) - parseHHMM(b.open))[0];
        const minsToday = 24 * 60 - min;
        const minsNext = (d - 1) * 24 * 60 + parseHHMM(firstSlot.open);
        return { isOpen: false, minutesUntilOpen: minsToday + minsNext };
      }
    }
  }
  return { isOpen: false, minutesUntilOpen: null };
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

// ── Animation classes ─────────────────────────────────────────────────────────
const ANIM_IN: Record<string, string> = {
  slide: 'notif-slide-in',
  fade: 'notif-fade-in',
  bounce: 'notif-bounce-in',
};
const ANIM_OUT: Record<string, string> = {
  slide: 'notif-slide-out',
  fade: 'notif-fade-out',
  bounce: 'notif-slide-out',
};

// ── Smart multi-banner component ──────────────────────────────────────────────
export function SmartNotificationBar({ banners, openingHours = [], locale }: Props) {
  const [now, setNow] = useState(() => new Date());
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'in' | 'visible' | 'out'>('in');
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Tick every minute to re-evaluate schedules & restaurant status
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const status = getRestaurantStatus(openingHours, now);

  // Build display list: active banners filtered by schedule
  // If restaurant is closed and there's a "closed" type banner active, use its text
  // If restaurant is open and there's an "open" type banner active, inject it
  const activeBanners = getActiveBanners(banners, now).filter(b => {
    if (b.type === 'closed' && status.isOpen) return false;
    if (b.type === 'open' && !status.isOpen) return false;
    return true;
  });

  // Auto-add a synthetic "closed" banner if restaurant is closed and no custom closed banner
  const hasClosed = activeBanners.some(b => b.type === 'closed');
  const syntheticClosed: NotificationBannerData | null =
    !status.isOpen && !hasClosed && openingHours.length > 0
      ? {
          id: -1, isVisible: true,
          bgColor: '#1a1a1a', textColor: '#f59e0b',
          icon: '🕐', link: null, linkLabel: null,
          priority: 999, displayDuration: 10000,
          animType: 'slide', type: 'closed',
          scheduleEnabled: false, scheduleStart: null, scheduleEnd: null,
          scheduleDays: '[0,1,2,3,4,5,6]', sortOrder: 0,
          translations: [
            {
              locale: 'fr',
              text: status.minutesUntilOpen != null
                ? `Restaurant fermé · Réouverture dans ${formatMinutes(status.minutesUntilOpen)}`
                : 'Restaurant fermé pour aujourd\'hui',
            },
            {
              locale: 'en',
              text: status.minutesUntilOpen != null
                ? `Closed · Reopening in ${formatMinutes(status.minutesUntilOpen)}`
                : 'Closed today',
            },
            {
              locale: 'it',
              text: status.minutesUntilOpen != null
                ? `Chiuso · Riapertura tra ${formatMinutes(status.minutesUntilOpen)}`
                : 'Chiuso oggi',
            },
            {
              locale: 'es',
              text: status.minutesUntilOpen != null
                ? `Cerrado · Reapertura en ${formatMinutes(status.minutesUntilOpen)}`
                : 'Cerrado hoy',
            },
          ],
        }
      : null;

  const display = syntheticClosed
    ? [syntheticClosed, ...activeBanners]
    : activeBanners;

  // Reset index when display list changes
  useEffect(() => {
    setIdx(0);
    setPhase('in');
    setDismissed(false);
  }, [display.length]);

  const advanceToNext = useCallback(() => {
    if (display.length <= 1) return;
    setPhase('out');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIdx(i => (i + 1) % display.length);
      setPhase('in');
    }, 350);
  }, [display.length]);

  // Enter → visible → exit cycle
  useEffect(() => {
    if (display.length === 0 || dismissed) return;
    clearTimeout(timerRef.current);

    if (phase === 'in') {
      timerRef.current = setTimeout(() => setPhase('visible'), 350);
    } else if (phase === 'visible') {
      if (display.length <= 1) return; // single banner: stay forever
      const dur = display[idx]?.displayDuration ?? 8000;
      timerRef.current = setTimeout(advanceToNext, dur);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, idx, display, dismissed, advanceToNext]);

  if (display.length === 0 || dismissed) return null;

  const banner = display[idx % display.length];
  const text = getT(banner.translations, locale);
  if (!text) return null;

  const animClass = phase === 'in'
    ? ANIM_IN[banner.animType] || ANIM_IN.slide
    : phase === 'out'
    ? ANIM_OUT[banner.animType] || ANIM_OUT.slide
    : '';

  const inner = (
    <div
      className={`relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium w-full overflow-hidden ${animClass}`}
      style={{ backgroundColor: banner.bgColor, color: banner.textColor }}
    >
      {/* Dot indicator for multiple banners */}
      {display.length > 1 && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1">
          {display.map((_, i) => (
            <button
              key={i}
              onClick={() => { clearTimeout(timerRef.current); setIdx(i); setPhase('in'); }}
              className="rounded-full transition-all"
              style={{
                width: i === idx ? '12px' : '5px',
                height: '5px',
                background: i === idx ? banner.textColor : `${banner.textColor}50`,
              }}
            />
          ))}
        </div>
      )}

      {banner.icon && <span className="flex-shrink-0">{banner.icon}</span>}
      <span className="text-center leading-snug">{text}</span>
      {banner.linkLabel && (
        <span className="font-bold underline ml-1 opacity-90 flex-shrink-0 whitespace-nowrap">
          {banner.linkLabel} →
        </span>
      )}

      {/* Dismiss button */}
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setDismissed(true); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Fermer"
      >
        <X className="w-3.5 h-3.5" style={{ color: banner.textColor }} />
      </button>

      {/* Progress bar (bottom) for multi-banner cycling */}
      {display.length > 1 && phase === 'visible' && (
        <span
          key={`prog-${idx}-${phase}`}
          className="absolute bottom-0 left-0 h-0.5 rounded-full"
          style={{
            backgroundColor: banner.textColor,
            animation: `notif-progress ${banner.displayDuration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );

  if (banner.link) {
    return (
      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

// ── Legacy single-bar export (backward compat) ────────────────────────────────
export function NotificationBarComponent({ bar, locale }: LegacyProps) {
  const t =
    bar.translations.find(x => x.locale === locale && x.text) ||
    bar.translations.find(x => x.locale === 'fr' && x.text) ||
    bar.translations.find(x => x.text);

  if (!t?.text) return null;

  const inner = (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-center w-full"
      style={{ backgroundColor: bar.bgColor, color: bar.textColor }}
    >
      {bar.icon && <span>{bar.icon}</span>}
      <span>{t.text}</span>
      {bar.link && bar.linkLabel && (
        <span className="font-bold underline ml-1 opacity-90">{bar.linkLabel} →</span>
      )}
    </div>
  );

  if (bar.link) {
    return (
      <a href={bar.link} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

export default NotificationBarComponent;
