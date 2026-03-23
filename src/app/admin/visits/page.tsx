'use client';

import { useState, useEffect, useCallback } from 'react';

interface ChartDay { date: string; count: number }
interface RecentVisit { id: number; ip: string | null; userAgent: string | null; page: string; createdAt: string }
interface Stats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  weekVisits: number;
  chartDays: ChartDay[];
  pageBreakdown: Record<string, number>;
  recentVisits: RecentVisit[];
}

type Period = '7' | '30' | 'all';

/* ─── SVG Bar Chart ─── */
function BarChart({ days }: { days: ChartDay[] }) {
  const W = 600;
  const H = 120;
  const PAD = { top: 10, bottom: 28, left: 28, right: 8 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const max = Math.max(...days.map(d => d.count), 1);
  const barW = Math.max(2, (chartW / days.length) - 2);

  // Show only some date labels
  const labelEvery = days.length <= 7 ? 1 : days.length <= 14 ? 2 : 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" style={{ overflow: 'visible' }}>
      {/* Y gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = PAD.top + chartH * (1 - ratio);
        return (
          <g key={ratio}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            {ratio > 0 && (
              <text x={PAD.left - 4} y={y + 3.5} textAnchor="end"
                fontSize={8} fill="rgba(255,255,255,0.3)">
                {Math.round(max * ratio)}
              </text>
            )}
          </g>
        );
      })}

      {/* Bars */}
      {days.map((d, i) => {
        const barH = max === 0 ? 0 : (d.count / max) * chartH;
        const x = PAD.left + i * (chartW / days.length) + (chartW / days.length - barW) / 2;
        const y = PAD.top + chartH - barH;
        const isToday = d.date === new Date().toISOString().split('T')[0];

        return (
          <g key={d.date}>
            <rect
              x={x} y={y} width={barW} height={Math.max(barH, d.count > 0 ? 2 : 0)}
              rx={2}
              fill={isToday ? '#F59E0B' : d.count > 0 ? 'rgba(245,158,11,0.55)' : 'rgba(255,255,255,0.05)'}
            />
            {d.count > 0 && barH > 10 && (
              <text x={x + barW / 2} y={y - 2} textAnchor="middle"
                fontSize={7} fill="rgba(255,255,255,0.6)">
                {d.count}
              </text>
            )}
            {/* Date label */}
            {i % labelEvery === 0 && (
              <text
                x={x + barW / 2} y={H - 4}
                textAnchor="middle" fontSize={7.5}
                fill={isToday ? '#F59E0B' : 'rgba(255,255,255,0.35)'}
              >
                {new Date(d.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function parseUA(ua: string | null): string {
  if (!ua) return '—';
  if (/iPhone|iPad/.test(ua)) return '📱 iOS';
  if (/Android/.test(ua)) return '📱 Android';
  if (/Windows/.test(ua)) return '🖥️ Windows';
  if (/Mac/.test(ua)) return '🖥️ macOS';
  if (/Linux/.test(ua)) return '🖥️ Linux';
  return '🌐 Navigateur';
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminVisitsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState<Period>('30');
  const [loading, setLoading] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [toast, setToast] = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, settingsRes] = await Promise.all([
        fetch(`/api/visits?period=${period}`),
        fetch('/api/settings'),
      ]);
      const data = await statsRes.json();
      const settings = await settingsRes.json();
      setStats(data);
      setTrackingEnabled(settings.trackingEnabled !== false);
    } catch {
      showToast('❌ Erreur de chargement');
    }
    setLoading(false);
  }, [period]);

  useEffect(() => { load(); }, [load]);

  async function toggleTracking() {
    const newVal = !trackingEnabled;
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingEnabled: newVal }),
    });
    setTrackingEnabled(newVal);
    showToast(newVal ? '✅ Tracking activé' : '⏸️ Tracking désactivé');
  }

  async function resetStats() {
    if (!confirm('Supprimer toutes les statistiques de visites ? Cette action est irréversible.')) return;
    await fetch('/api/visits', { method: 'DELETE' });
    showToast('🗑️ Statistiques réinitialisées');
    load();
  }

  const kpis = stats ? [
    { label: 'Visites totales',    value: stats.totalVisits,    icon: '👁️',  color: '#3B82F6' },
    { label: 'Visiteurs uniques',  value: stats.uniqueVisitors, icon: '👤',  color: '#8B5CF6' },
    { label: "Visites aujourd'hui",value: stats.todayVisits,    icon: '📅',  color: '#10B981' },
    { label: 'Cette semaine',      value: stats.weekVisits,     icon: '📈',  color: '#F59E0B' },
  ] : [];

  return (
    <div className="p-6 max-w-4xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg text-sm border border-gray-700">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">📊 Statistiques de visites</h1>
          <p className="text-gray-500 text-sm mt-0.5">Suivi du trafic sans cookies ni localStorage</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tracking toggle */}
          <button
            onClick={toggleTracking}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              trackingEnabled
                ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${trackingEnabled ? 'bg-green-400' : 'bg-gray-500'}`} />
            {trackingEnabled ? 'Tracking actif' : 'Tracking inactif'}
          </button>
          <button
            onClick={resetStats}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            🗑️ Réinitialiser
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {([['7', '7 jours'], ['30', '30 jours'], ['all', 'Tout']] as [Period, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setPeriod(val)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              period === val ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-500">Chargement...</div>
      ) : stats ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {kpis.map(kpi => (
              <div key={kpi.label} className="admin-card p-4 text-center">
                <div className="text-2xl mb-1">{kpi.icon}</div>
                <p className="text-3xl font-black" style={{ color: kpi.color }}>{kpi.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="admin-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-sm">Évolution des visites</h2>
              <span className="text-xs text-gray-500">
                {period === '7' ? '7 derniers jours' : period === '30' ? '30 derniers jours' : '30 derniers jours'}
              </span>
            </div>
            {stats.chartDays.every(d => d.count === 0) ? (
              <div className="h-20 flex items-center justify-center text-gray-600 text-sm">
                Aucune visite enregistrée sur cette période
              </div>
            ) : (
              <BarChart days={stats.chartDays} />
            )}
          </div>

          {/* Page breakdown + Recent */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Page breakdown */}
            <div className="admin-card">
              <h2 className="font-bold text-white text-sm mb-3">📄 Pages visitées</h2>
              {Object.keys(stats.pageBreakdown).length === 0 ? (
                <p className="text-gray-600 text-sm">Aucune donnée</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(stats.pageBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([page, count]) => {
                      const total = stats.totalVisits || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={page}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300 font-medium">/{page}</span>
                            <span className="text-gray-500">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full">
                            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Recent visits */}
            <div className="admin-card sm:col-span-2">
              <h2 className="font-bold text-white text-sm mb-3">🕐 Dernières visites</h2>
              {stats.recentVisits.length === 0 ? (
                <p className="text-gray-600 text-sm">Aucune visite enregistrée</p>
              ) : (
                <div className="space-y-1.5">
                  {stats.recentVisits.map(v => (
                    <div key={v.id} className="flex items-center gap-3 py-1.5 border-b border-gray-800 last:border-0">
                      <span className="text-sm">{parseUA(v.userAgent)}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono text-gray-400">{v.ip || '—'}</span>
                        <span className="text-xs text-gray-600 mx-1.5">·</span>
                        <span className="text-xs text-amber-500/70">/{v.page}</span>
                      </div>
                      <span className="text-xs text-gray-600 flex-shrink-0">{formatTime(v.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RGPD note */}
          <p className="text-xs text-gray-700 text-center">
            🔒 Données anonymisées conforme RGPD — IP tronquée, aucun cookie, aucun localStorage
          </p>
        </>
      ) : null}
    </div>
  );
}
