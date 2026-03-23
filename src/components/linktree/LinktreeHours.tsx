'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface HourSlot { open: string; close: string; }
interface HourRow {
  id: number; dayOfWeek: number; dayName: string; isOpen: boolean; slots: string;
}
interface Props { hours: HourRow[]; locale: string; }

const DAY_NAMES: Record<string, Record<number, string>> = {
  fr: { 0: 'Lundi', 1: 'Mardi', 2: 'Mercredi', 3: 'Jeudi', 4: 'Vendredi', 5: 'Samedi', 6: 'Dimanche' },
  en: { 0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday' },
  it: { 0: 'Lunedì', 1: 'Martedì', 2: 'Mercoledì', 3: 'Giovedì', 4: 'Venerdì', 5: 'Sabato', 6: 'Domenica' },
  es: { 0: 'Lunes', 1: 'Martes', 2: 'Miércoles', 3: 'Jueves', 4: 'Viernes', 5: 'Sábado', 6: 'Domingo' },
};

const LABELS: Record<string, Record<string, string>> = {
  fr: { title: "Horaires d'ouverture", closed: 'Fermé', open: 'Ouvert maintenant', closedNow: 'Fermé maintenant', until: "Jusqu'à", opensAt: 'Ouvre à' },
  en: { title: 'Opening Hours', closed: 'Closed', open: 'Open now', closedNow: 'Closed now', until: 'Until', opensAt: 'Opens at' },
  it: { title: 'Orari di apertura', closed: 'Chiuso', open: 'Aperto adesso', closedNow: 'Chiuso adesso', until: 'Fino alle', opensAt: 'Apre alle' },
  es: { title: 'Horario de apertura', closed: 'Cerrado', open: 'Abierto ahora', closedNow: 'Cerrado ahora', until: 'Hasta las', opensAt: 'Abre a las' },
};

function getCurrentDayOfWeek(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function formatSlots(slotsJson: string): string {
  try {
    return (JSON.parse(slotsJson) as HourSlot[]).map(s => `${s.open} – ${s.close}`).join(' | ');
  } catch { return slotsJson; }
}

function getStatus(row: HourRow, L: Record<string, string>): { isOpenNow: boolean; badge: string; closeTime?: string } {
  if (!row.isOpen) return { isOpenNow: false, badge: L.closed };
  try {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const slots: HourSlot[] = JSON.parse(row.slots);
    for (const slot of slots) {
      const open = parseTime(slot.open);
      let close = parseTime(slot.close);
      if (close < open) close += 24 * 60; // crosses midnight
      if (currentMin >= open && currentMin < close) {
        return { isOpenNow: true, badge: L.open, closeTime: slot.close };
      }
    }
  } catch { /* noop */ }
  return { isOpenNow: false, badge: L.closedNow };
}

export default function LinktreeHours({ hours, locale }: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const today = getCurrentDayOfWeek();
  const dayNames = DAY_NAMES[locale] || DAY_NAMES.fr;
  const L = LABELS[locale] || LABELS.fr;
  const todayRow = hours.find(r => r.dayOfWeek === today);
  const todayStatus = todayRow ? getStatus(todayRow, L) : null;

  return (
    <div className="mx-4 mt-4">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🕐</span>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wide leading-none">{L.title}</p>
              {todayStatus && (
                <p className="text-[11px] mt-0.5 leading-none" style={{ color: todayStatus.isOpenNow ? '#4ade80' : '#f87171' }}>
                  {todayStatus.badge}
                  {todayStatus.isOpenNow && todayStatus.closeTime && (
                    <span className="text-white/40"> · {L.until} {todayStatus.closeTime}</span>
                  )}
                </p>
              )}
            </div>
          </div>
          {/* Live dot */}
          {todayStatus?.isOpenNow && (
            <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              {L.open}
            </span>
          )}
          {todayStatus && !todayStatus.isOpenNow && (
            <span className="bg-red-500/20 text-red-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-500/30">
              {L.closedNow}
            </span>
          )}
        </div>

        {/* Days */}
        <div className="divide-y divide-white/5">
          {hours.map((row) => {
            const isToday = row.dayOfWeek === today;
            const dayLabel = dayNames[row.dayOfWeek] || row.dayName;
            return (
              <div key={row.id}
                className={`flex items-center justify-between px-4 py-2.5 transition-colors ${isToday ? 'bg-amber-500/10' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                  <span className={`text-sm ${isToday ? 'font-bold text-amber-300' : 'text-white/50'}`}>
                    {dayLabel}
                  </span>
                </div>
                <span className={`text-sm text-right tabular-nums ${isToday ? 'font-semibold text-white' : 'text-white/40'}`}>
                  {row.isOpen ? formatSlots(row.slots) : L.closed}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
