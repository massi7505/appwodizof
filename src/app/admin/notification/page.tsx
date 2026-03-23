'use client';

import { useState, useEffect } from 'react';
import ColorPicker from '@/components/admin/ColorPicker';

const LOCALES = ['fr', 'en', 'it', 'es'];
const LOCALE_LABELS: Record<string, string> = { fr: '🇫🇷 FR', en: '🇬🇧 EN', it: '🇮🇹 IT', es: '🇪🇸 ES' };

const DEFAULT = {
  isVisible: true, bgColor: '#1F2937', textColor: '#F59E0B', icon: '', link: '', linkLabel: '',
  translations: LOCALES.map(l => ({ locale: l, text: '' })),
};

export default function AdminNotificationPage() {
  const [bar, setBar] = useState<any>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    const res = await fetch('/api/notification');
    const data = await res.json();
    if (data) setBar({ ...DEFAULT, ...data, translations: data.translations?.length ? data.translations : DEFAULT.translations });
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/notification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bar) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data) setBar({ ...DEFAULT, ...data, translations: data.translations?.length ? data.translations : DEFAULT.translations });
      showToast('✅ Barre de notification sauvegardée');
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg text-sm animate-slide-in border border-gray-700">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">📢 Barre de notification</h1>
          <p className="text-gray-500 text-sm mt-0.5">Bandeau sticky en haut du site</p>
        </div>
      </div>

      {/* Preview */}
      {bar.isVisible && bar.translations[0]?.text && (
        <div className="rounded-xl overflow-hidden mb-6">
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium" style={{ backgroundColor: bar.bgColor, color: bar.textColor }}>
            {bar.icon && <span>{bar.icon}</span>}
            <span>{bar.translations[0]?.text}</span>
            {bar.linkLabel && <span className="font-bold underline ml-1">{bar.linkLabel} →</span>}
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">Activation</h3>
            <div onClick={() => setBar((b: any) => ({ ...b, isVisible: !b.isVisible }))}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${bar.isVisible ? 'bg-amber-500' : 'bg-gray-700'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${bar.isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </div>
        </div>

        <div className="admin-card space-y-4">
          <h3 className="font-bold text-white">Apparence</h3>
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker value={bar.bgColor} onChange={c => setBar((b: any) => ({ ...b, bgColor: c }))} label="Couleur de fond" />
            <ColorPicker value={bar.textColor} onChange={c => setBar((b: any) => ({ ...b, textColor: c }))} label="Couleur du texte" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Icône / Emoji</label>
              <input type="text" value={bar.icon || ''} onChange={e => setBar((b: any) => ({ ...b, icon: e.target.value }))} className="admin-input text-center text-lg" placeholder="🎉" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Texte du lien</label>
              <input type="text" value={bar.linkLabel || ''} onChange={e => setBar((b: any) => ({ ...b, linkLabel: e.target.value }))} className="admin-input" placeholder="J'en profite" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">URL du lien</label>
              <input type="url" value={bar.link || ''} onChange={e => setBar((b: any) => ({ ...b, link: e.target.value }))} className="admin-input" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div className="admin-card space-y-4">
          <h3 className="font-bold text-white">Textes (multilingue)</h3>
          {LOCALES.map(locale => {
            const t = bar.translations?.find((x: any) => x.locale === locale) || { locale, text: '' };
            return (
              <div key={locale}>
                <label className="block text-xs font-bold text-gray-500 mb-1">{LOCALE_LABELS[locale]}</label>
                <input
                  type="text"
                  value={t.text || ''}
                  onChange={e => setBar((b: any) => ({ ...b, translations: (b.translations || []).map((x: any) => x.locale === locale ? { ...x, text: e.target.value } : x) }))}
                  className="admin-input"
                  placeholder={locale === 'fr' ? 'Frais de livraison OFFERTS avec Amazon Prime*' : `Text in ${locale}`}
                />
              </div>
            );
          })}
        </div>

        <button onClick={save} disabled={saving} className="w-full admin-btn-primary py-3 text-base disabled:opacity-50">
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
        </button>
      </div>
    </div>
  );
}
