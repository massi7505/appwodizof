'use client';

import {
  ShoppingBag, UtensilsCrossed, MapPin, Phone, Star, Clock, Globe,
  Instagram, Youtube, Facebook, Twitter, Music2, Link2, ExternalLink,
  Heart, Gift, Ticket, Award, Truck, Coffee, Pizza, Salad, ChefHat,
  Bike, Car, Navigation, MessageCircle, Send, BookOpen, Camera,
  Percent, Tag, Flame, Leaf, Fish, Beef, Egg, Wheat, ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Button {
  id: number;
  label: string;
  url: string;
  icon?: string | null;
  iconUrl?: string | null;
  bgColor: string;
  bgGradient?: string | null;
  textColor: string;
  borderColor?: string | null;
  style: string;
  section: string;
  sortOrder: number;
  labelTranslations?: string | null;
}

interface Props {
  buttons: Button[];
  locale?: string;
}

const SECTION_META: Record<string, { label: string; icon: string; description: string }> = {
  main:      { label: '',           icon: '',   description: '' },
  commander: { label: 'Commander',  icon: '🛒', description: 'Choisissez votre plateforme' },
  contact:   { label: 'Nous contacter', icon: '📞', description: 'Appelez-nous ou trouvez-nous' },
  discover:  { label: 'Découvrir',  icon: '✨', description: 'En savoir plus' },
  social:    { label: 'Réseaux',    icon: '📲', description: 'Suivez-nous' },
  info:      { label: 'Infos',      icon: 'ℹ️', description: 'Informations utiles' },
};

const ICON_MAP: Record<string, { Icon: LucideIcon; anim: string }> = {
  'shopping-bag': { Icon: ShoppingBag,     anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'bag':          { Icon: ShoppingBag,     anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'ubereats':     { Icon: ShoppingBag,     anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'deliveroo':    { Icon: Bike,            anim: 'group-hover:scale-110 group-hover:-translate-x-1' },
  'delivery':     { Icon: Truck,           anim: 'group-hover:scale-110 group-hover:translate-x-1' },
  'truck':        { Icon: Truck,           anim: 'group-hover:scale-110 group-hover:translate-x-1' },
  'bike':         { Icon: Bike,            anim: 'group-hover:scale-110 group-hover:-translate-x-1' },
  'car':          { Icon: Car,             anim: 'group-hover:scale-110 group-hover:translate-x-1' },
  'food':         { Icon: UtensilsCrossed, anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'utensils':     { Icon: UtensilsCrossed, anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'menu':         { Icon: BookOpen,        anim: 'group-hover:scale-110 group-hover:rotate-3' },
  'pizza':        { Icon: Pizza,           anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'coffee':       { Icon: Coffee,          anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'salad':        { Icon: Salad,           anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'chef':         { Icon: ChefHat,         anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'fish':         { Icon: Fish,            anim: 'group-hover:scale-110 group-hover:translate-x-1' },
  'beef':         { Icon: Beef,            anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'egg':          { Icon: Egg,             anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'wheat':        { Icon: Wheat,           anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'leaf':         { Icon: Leaf,            anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'vegan':        { Icon: Leaf,            anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'flame':        { Icon: Flame,           anim: 'group-hover:scale-125 group-hover:-translate-y-1' },
  'spicy':        { Icon: Flame,           anim: 'group-hover:scale-125 group-hover:-translate-y-1' },
  'map':          { Icon: MapPin,          anim: 'group-hover:scale-110 group-hover:-translate-y-1' },
  'map-pin':      { Icon: MapPin,          anim: 'group-hover:scale-110 group-hover:-translate-y-1' },
  'location':     { Icon: MapPin,          anim: 'group-hover:scale-110 group-hover:-translate-y-1' },
  'navigation':   { Icon: Navigation,      anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'phone':        { Icon: Phone,           anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'message':      { Icon: MessageCircle,   anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'whatsapp':     { Icon: MessageCircle,   anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'telegram':     { Icon: Send,            anim: 'group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1' },
  'instagram':    { Icon: Instagram,       anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'facebook':     { Icon: Facebook,        anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'twitter':      { Icon: Twitter,         anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'youtube':      { Icon: Youtube,         anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'tiktok':       { Icon: Music2,          anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'music':        { Icon: Music2,          anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'camera':       { Icon: Camera,          anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'globe':        { Icon: Globe,           anim: 'group-hover:scale-110 group-hover:rotate-180' },
  'website':      { Icon: Globe,           anim: 'group-hover:scale-110 group-hover:rotate-180' },
  'link':         { Icon: ExternalLink,    anim: 'group-hover:scale-110 group-hover:translate-x-0.5 group-hover:-translate-y-0.5' },
  'external':     { Icon: ExternalLink,    anim: 'group-hover:scale-110 group-hover:translate-x-0.5 group-hover:-translate-y-0.5' },
  'star':         { Icon: Star,            anim: 'group-hover:scale-125 group-hover:rotate-12' },
  'review':       { Icon: Star,            anim: 'group-hover:scale-125 group-hover:rotate-12' },
  'heart':        { Icon: Heart,           anim: 'group-hover:scale-125 group-hover:-translate-y-0.5' },
  'gift':         { Icon: Gift,            anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'ticket':       { Icon: Ticket,          anim: 'group-hover:scale-110 group-hover:rotate-3' },
  'promo':        { Icon: Percent,         anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'percent':      { Icon: Percent,         anim: 'group-hover:scale-110 group-hover:rotate-12' },
  'tag':          { Icon: Tag,             anim: 'group-hover:scale-110 group-hover:rotate-6' },
  'award':        { Icon: Award,           anim: 'group-hover:scale-110 group-hover:-rotate-6' },
  'clock':        { Icon: Clock,           anim: 'group-hover:scale-110 group-hover:rotate-180' },
  'hours':        { Icon: Clock,           anim: 'group-hover:scale-110 group-hover:rotate-180' },
};

function isExternalSvg(icon: string) {
  return icon.startsWith('<svg') || icon.startsWith('<?xml');
}

function resolveIcon(icon?: string | null, iconUrl?: string | null) {
  if (iconUrl) return { type: 'url' as const, iconUrl };
  if (!icon) return { type: 'default' as const };
  if (isExternalSvg(icon)) return { type: 'svg' as const, svg: icon };
  const key = icon.toLowerCase().trim();
  if (ICON_MAP[key]) return { type: 'lucide' as const, ...ICON_MAP[key] };
  return { type: 'emoji' as const, emoji: icon };
}

function IconBox({ icon, iconUrl, textColor, size = 'lg' }: {
  icon?: string | null; iconUrl?: string | null; textColor: string; size?: 'sm' | 'lg'
}) {
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-11 h-11';
  const icSize = size === 'sm' ? 'w-5 h-5' : 'w-5 h-5';
  const base = `${dim} rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300`;
  const bgStyle = { background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' };
  const resolved = resolveIcon(icon, iconUrl);

  if (resolved.type === 'url') return (
    <div className={`${base} group-hover:scale-110`} style={bgStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={resolved.iconUrl} alt="" className={`${icSize} object-contain`} />
    </div>
  );
  if (resolved.type === 'svg') return (
    <div className={`${base} group-hover:scale-110`} style={bgStyle}
      dangerouslySetInnerHTML={{ __html: resolved.svg }} />
  );
  if (resolved.type === 'lucide') {
    const { Icon, anim } = resolved;
    return (
      <div className={`${base} ${anim}`} style={bgStyle}>
        <Icon className={icSize} style={{ color: textColor }} aria-hidden="true" />
      </div>
    );
  }
  if (resolved.type === 'emoji') return (
    <div className={`${base} group-hover:scale-110 text-lg`} style={bgStyle}>
      {resolved.emoji}
    </div>
  );
  return (
    <div className={`${base} group-hover:scale-110`} style={bgStyle}>
      <Link2 className={icSize} style={{ color: textColor }} aria-hidden="true" />
    </div>
  );
}

function getLabel(btn: Button, locale?: string): string {
  if (locale && btn.labelTranslations) {
    try { return JSON.parse(btn.labelTranslations)[locale] || btn.label; } catch { /* noop */ }
  }
  return btn.label;
}

function btnStyle(btn: Button): React.CSSProperties {
  if (btn.style === 'outline') return {
    background: 'transparent',
    border: `1.5px solid ${btn.borderColor || btn.bgColor}`,
    color: btn.textColor,
  };
  if (btn.style === 'ghost') return {
    background: `${btn.bgColor}22`,
    color: btn.textColor,
    border: `1px solid ${btn.bgColor}44`,
  };
  return {
    background: btn.bgGradient || btn.bgColor,
    color: btn.textColor,
  };
}

/* ─── Full-width button ─── */
function FullBtn({ btn, locale }: { btn: Button; locale?: string }) {
  return (
    <a
      href={btn.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center w-full rounded-2xl px-4 py-3.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] overflow-hidden"
      style={btnStyle(btn)}
    >
      {/* Shine sweep on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)' }} />

      <IconBox icon={btn.icon} iconUrl={btn.iconUrl} textColor={btn.textColor} size="lg" />

      <span className="flex-1 font-semibold text-sm mx-3.5 leading-tight">
        {getLabel(btn, locale)}
      </span>

      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 group-hover:translate-x-0.5"
        style={{ background: 'rgba(255,255,255,0.15)' }}>
        <ArrowRight className="w-3.5 h-3.5" style={{ color: btn.textColor }} />
      </div>
    </a>
  );
}

/* ─── Compact card for grid layout ─── */
function CompactBtn({ btn, locale }: { btn: Button; locale?: string }) {
  return (
    <a
      href={btn.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col items-center justify-center rounded-2xl px-3 py-5 text-center transition-all duration-200 hover:scale-[1.04] hover:shadow-xl active:scale-[0.97] gap-2.5 overflow-hidden"
      style={btnStyle(btn)}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10), transparent)' }} />
      <IconBox icon={btn.icon} iconUrl={btn.iconUrl} textColor={btn.textColor} size="lg" />
      <span className="font-bold text-xs leading-tight line-clamp-2 relative z-10">
        {getLabel(btn, locale)}
      </span>
    </a>
  );
}

export default function LinktreeButtons({ buttons, locale }: Props) {
  const sections = buttons.reduce<Record<string, Button[]>>((acc, btn) => {
    const sec = btn.section || 'main';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(btn);
    return acc;
  }, {});

  return (
    <div className="px-4 mt-6 space-y-3">
      {Object.entries(sections).map(([section, btns]) => {
        const meta = SECTION_META[section];
        const useGrid = btns.length >= 3 && section !== 'main';

        return (
          <div
            key={section}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)' }}
          >
            {/* Section header */}
            {section !== 'main' && meta?.label && (
              <div
                className="flex items-center gap-2.5 px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
              >
                <span className="text-base leading-none">{meta.icon}</span>
                <div>
                  <p className="text-xs font-black text-white/80 uppercase tracking-widest leading-none">
                    {meta.label}
                  </p>
                  {meta.description && (
                    <p className="text-[10px] text-white/35 mt-0.5 leading-none">{meta.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className={useGrid ? 'grid grid-cols-2 gap-2 p-3' : 'flex flex-col gap-2 p-3'}>
              {useGrid
                ? btns.map(btn => <CompactBtn key={btn.id} btn={btn} locale={locale} />)
                : btns.map(btn => <FullBtn key={btn.id} btn={btn} locale={locale} />)
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}
