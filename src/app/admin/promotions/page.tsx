'use client';

import { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import ColorPicker from '@/components/admin/ColorPicker';
import { ChevronSortUpIcon, ChevronSortDownIcon, EyeIcon, EditIcon, TrashIcon, CloseIcon } from '@/components/ui/icons';

const LOCALES = ['fr', 'en', 'it', 'es'];
const LOCALE_LABELS: Record<string, string> = { fr: '🇫🇷 FR', en: '🇬🇧 EN', it: '🇮🇹 IT', es: '🇪🇸 ES' };
const PROMO_TYPES = ['delivery', 'takeaway', 'onsite', 'all'];
const TYPE_LABELS: Record<string, string> = { delivery: '🛵 Livraison', takeaway: '🥡 À emporter', onsite: '🪑 Sur place', all: '🌐 Toutes' };
const BG_TYPES = ['color', 'gradient', 'image'];

const DEFAULT_PROMO = {
  type: 'delivery', bgType: 'color', bgColor: '#F59E0B', textColor: '#FFFFFF',
  badgeColor: '#EF4444', promoPrice: '', originalPrice: '', photoOnly: false,
  isVisible: true, showOnLinktree: true, showOnMenu: true,
  translations: LOCALES.map(l => ({ locale: l, title: '', description: '', cta: '', ctaUrl: '' })),
};

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    const res = await fetch('/api/promotions?visible=false');
    setPromos(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch('/api/promotions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const p = await res.json();
        setPromos(ps => [...ps, p]);
      } else {
        const res = await fetch(`/api/promotions/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const p = await res.json();
        setPromos(ps => ps.map(x => x.id === p.id ? p : x));
      }
      setEditing(null);
      showToast('✅ Promotion sauvegardée');
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSaving(false);
  }

  async function deletePromo(id: number) {
    if (!confirm('Supprimer cette promotion ?')) return;
    await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
    setPromos(ps => ps.filter(x => x.id !== id));
    showToast('🗑️ Supprimée');
  }

  async function togglePromo(promo: any, field: string) {
    const res = await fetch(`/api/promotions/${promo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !promo[field] }),
    });
    const updated = await res.json();
    setPromos(ps => ps.map(x => x.id === updated.id ? { ...x, ...updated } : x));
  }

  function movePromo(i: number, dir: -1 | 1) {
    const newPs = [...promos];
    const target = i + dir;
    if (target < 0 || target >= newPs.length) return;
    [newPs[i], newPs[target]] = [newPs[target], newPs[i]];
    const updated = newPs.map((p, idx) => ({ ...p, sortOrder: idx }));
    setPromos(updated);
    fetch('/api/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'promotion', items: updated.map(p => ({ id: p.id, sortOrder: p.sortOrder })) }) });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">🎯 Promotions</h1>
          <p className="text-gray-500 text-sm mt-0.5">{promos.filter(p => p.isVisible).length} actives · {promos.length} total</p>
        </div>
        <button onClick={() => { setEditing(JSON.parse(JSON.stringify(DEFAULT_PROMO))); setIsNew(true); }} className="admin-btn-primary">
          + Ajouter
        </button>
      </div>

      <div className="space-y-3">
        {promos.length === 0 && (
          <div className="admin-card text-center text-gray-500 py-12">Aucune promotion. Créez votre première offre !</div>
        )}
        {promos.map((promo, i) => {
          const t = promo.translations?.find((x: any) => x.locale === 'fr') || promo.translations?.[0];
          return (
            <div key={promo.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${promo.isVisible ? 'border-gray-700 bg-gray-800' : 'border-gray-800 bg-gray-900 opacity-60'}`}>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => movePromo(i, -1)} className="text-gray-600 hover:text-gray-300 p-0.5"><ChevronSortUpIcon /></button>
                <button onClick={() => movePromo(i, 1)} className="text-gray-600 hover:text-gray-300 p-0.5"><ChevronSortDownIcon /></button>
              </div>
              <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: promo.bgGradient || promo.bgColor }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{t?.title || '—'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-amber-400 font-bold">{parseFloat(promo.promoPrice).toFixed(2)}€</span>
                  {promo.originalPrice && <span className="text-xs text-gray-500 line-through">{parseFloat(promo.originalPrice).toFixed(2)}€</span>}
                  <span className="text-xs text-gray-500">{TYPE_LABELS[promo.type]}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => togglePromo(promo, 'isVisible')} title="Visible" className={`p-1.5 rounded-lg transition-colors ${promo.isVisible ? 'text-green-400' : 'text-gray-600'} hover:bg-white/5`}>
                  <EyeIcon />
                </button>
                <button onClick={() => { setEditing({ ...promo, translations: promo.translations?.length ? promo.translations : DEFAULT_PROMO.translations }); setIsNew(false); }} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                  <EditIcon />
                </button>
                <button onClick={() => deletePromo(promo.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <TrashIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="font-bold text-white">{isNew ? 'Nouvelle promotion' : 'Modifier la promotion'}</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white"><CloseIcon /></button>
            </div>

            {/* Live Preview */}
            <div className="px-5 pt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Aperçu</p>
              {editing.photoOnly && editing.bgImageUrl ? (
                <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '16/7' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editing.bgImageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="relative rounded-2xl p-5 overflow-hidden min-h-[110px]"
                  style={{
                    background: editing.bgType === 'gradient' ? (editing.bgGradient || editing.bgColor || '#F59E0B')
                      : editing.bgType === 'image' ? (editing.bgImageUrl ? `url(${editing.bgImageUrl}) center/cover no-repeat` : editing.bgColor || '#F59E0B')
                      : (editing.bgColor || '#F59E0B'),
                    color: editing.textColor || '#fff',
                  }}
                >
                  {editing.bgType === 'image' && editing.bgImageUrl && (
                    <div className="absolute inset-0 bg-black/30 rounded-2xl" />
                  )}
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {editing.badgeText && (
                        <span className="inline-block text-xs font-black px-2.5 py-1 rounded-full mb-2 text-white"
                          style={{ backgroundColor: editing.badgeColor || '#EF4444' }}>
                          {editing.badgeText}
                        </span>
                      )}
                      <p className="font-black text-lg leading-tight">
                        {editing.translations?.find((x: any) => x.locale === 'fr')?.title || 'Titre de l\'offre'}
                      </p>
                      {editing.translations?.find((x: any) => x.locale === 'fr')?.description && (
                        <p className="text-sm mt-1 opacity-80">
                          {editing.translations.find((x: any) => x.locale === 'fr').description}
                        </p>
                      )}
                    </div>
                    {editing.promoPrice && (
                      <div className="flex-shrink-0 text-right">
                        {editing.originalPrice && (
                          <p className="text-sm line-through opacity-60">{parseFloat(editing.originalPrice).toFixed(2)}€</p>
                        )}
                        <p className="text-3xl font-black">{parseFloat(editing.promoPrice || '0').toFixed(2)}€</p>
                      </div>
                    )}
                  </div>
                  {editing.translations?.find((x: any) => x.locale === 'fr')?.cta && (
                    <div className="relative z-10 mt-3">
                      <span className="inline-block text-xs font-bold px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                        {editing.translations.find((x: any) => x.locale === 'fr').cta}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 space-y-5">
              {/* Mode photo uniquement */}
              <label className="flex items-center gap-3 cursor-pointer bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
                <input
                  type="checkbox"
                  checked={!!editing.photoOnly}
                  onChange={e => setEditing((x: any) => ({ ...x, photoOnly: e.target.checked }))}
                  className="accent-amber-500 w-4 h-4"
                />
                <div>
                  <p className="text-sm font-semibold text-white">🖼️ Photo uniquement</p>
                  <p className="text-xs text-gray-500 mt-0.5">Affiche seulement l'image, sans texte ni prix</p>
                </div>
              </label>

              {/* Type */}
              {!editing.photoOnly && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Type d'offre</label>
                  <div className="flex flex-wrap gap-2">
                    {PROMO_TYPES.map(t => (
                      <button key={t} type="button" onClick={() => setEditing((e: any) => ({ ...e, type: t }))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${editing.type === t ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Prix */}
              {!editing.photoOnly && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Badge texte</label>
                    <input type="text" value={editing.badgeText || ''} onChange={e => setEditing((x: any) => ({ ...x, badgeText: e.target.value }))} className="admin-input" placeholder="MENU MIDI" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Prix promo (€)</label>
                    <input type="number" step="0.01" value={editing.promoPrice || ''} onChange={e => setEditing((x: any) => ({ ...x, promoPrice: e.target.value }))} className="admin-input" placeholder="10.90" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Prix original (€)</label>
                    <input type="number" step="0.01" value={editing.originalPrice || ''} onChange={e => setEditing((x: any) => ({ ...x, originalPrice: e.target.value }))} className="admin-input" placeholder="12.90" />
                  </div>
                </div>
              )}

              {/* Background */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Arrière-plan</label>
                <div className="flex gap-2 mb-3">
                  {BG_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setEditing((e: any) => ({ ...e, bgType: t }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${editing.bgType === t ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                      {t === 'color' ? '🎨 Couleur' : t === 'gradient' ? '🌈 Dégradé' : '🖼️ Image'}
                    </button>
                  ))}
                </div>
                {editing.bgType === 'color' && <ColorPicker value={editing.bgColor} onChange={c => setEditing((e: any) => ({ ...e, bgColor: c }))} label="Couleur" />}
                {editing.bgType === 'gradient' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">CSS gradient</label>
                    <input type="text" value={editing.bgGradient || ''} onChange={e => setEditing((x: any) => ({ ...x, bgGradient: e.target.value }))} className="admin-input font-mono text-xs" placeholder="linear-gradient(135deg, #F59E0B, #EF4444)" />
                    <div className="mt-2 h-10 rounded-xl" style={{ background: editing.bgGradient || '' }} />
                  </div>
                )}
                {editing.bgType === 'image' && <ImageUploader value={editing.bgImageUrl} onChange={(url: string) => setEditing((e: any) => ({ ...e, bgImageUrl: url }))} folder="promos" label="Image de fond" aspectRatio="aspect-video" />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ColorPicker value={editing.textColor} onChange={c => setEditing((e: any) => ({ ...e, textColor: c }))} label="Couleur du texte" />
                <ColorPicker value={editing.badgeColor} onChange={c => setEditing((e: any) => ({ ...e, badgeColor: c }))} label="Couleur du badge" />
              </div>

              {/* Visibilité */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'isVisible', label: '👁️ Visible' },
                  { key: 'showOnLinktree', label: '🔗 Sur Linktree' },
                  { key: 'showOnMenu', label: '🍕 Sur Menu' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer bg-gray-800 rounded-xl px-3 py-2">
                    <input type="checkbox" checked={!!editing[key]} onChange={e => setEditing((x: any) => ({ ...x, [key]: e.target.checked }))} className="accent-amber-500 w-4 h-4" />
                    <span className="text-xs text-white">{label}</span>
                  </label>
                ))}
              </div>

              {/* Traductions */}
              {!editing.photoOnly && (
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-sm font-semibold text-white mb-3">Traductions</p>
                  <div className="space-y-4">
                    {LOCALES.map(locale => {
                      const t = editing.translations?.find((x: any) => x.locale === locale) || { locale, title: '', description: '', cta: '', ctaUrl: '' };
                      const update = (field: string, val: string) => setEditing((e: any) => ({ ...e, translations: (e.translations || []).map((x: any) => x.locale === locale ? { ...x, [field]: val } : x) }));
                      return (
                        <div key={locale}>
                          <label className="block text-xs font-bold text-gray-500 mb-2">{LOCALE_LABELS[locale]}</label>
                          <input type="text" value={t.title || ''} onChange={e => update('title', e.target.value)} className="admin-input mb-2" placeholder="Titre de l'offre *" />
                          <textarea value={t.description || ''} onChange={e => update('description', e.target.value)} className="admin-input text-xs resize-none h-14 mb-2" placeholder="Description" />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" value={t.cta || ''} onChange={e => update('cta', e.target.value)} className="admin-input text-xs" placeholder="Texte CTA (ex: J'en profite)" />
                            <input type="url" value={t.ctaUrl || ''} onChange={e => update('ctaUrl', e.target.value)} className="admin-input text-xs" placeholder="URL CTA" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 p-5 pt-0">
              <button onClick={() => setEditing(null)} className="flex-1 admin-btn-ghost">Annuler</button>
              <button onClick={save} disabled={saving || (!editing.photoOnly && !editing.promoPrice)} className="flex-1 admin-btn-primary disabled:opacity-50">{saving ? 'Sauvegarde...' : isNew ? 'Créer' : 'Sauvegarder'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
