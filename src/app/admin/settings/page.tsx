'use client';

import { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import ColorPicker from '@/components/admin/ColorPicker';

function contrastColor(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length < 6) return '#ffffff';
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

const DEFAULT_SETTINGS = {
  siteName: 'Woodiz Paris 15', siteSlogan: 'Pizza artisanale au feu de bois',
  logoUrl: '', faviconUrl: '', defaultLanguage: 'fr', homePage: 'linktree',
  primaryColor: '#F59E0B', secondaryColor: '#1F2937', accentColor: '#EF4444',
  backgroundColor: '#111827', textColor: '#FFFFFF',
  googleMapsUrl: '', googleReviewsUrl: '', instagramUrl: '',
  phoneNumber: '', address: '', metaTitle: '', metaDescription: '', metaKeywords: '',
  metaImageUrl: '', canonicalUrl: '', enabledLocales: '["fr","en","it","es"]',
  reviewPopupEnabled: false, reviewPopupDelay: 5,
  showFeatured: true, showWeekSpecial: true,
  featuredTitles: '{"fr":"⭐ Produits en Vedette","en":"⭐ Featured Products","it":"⭐ Prodotti in Evidenza","es":"⭐ Productos Destacados"}',
  weekTitles: '{"fr":"🔥 Produit de la Semaine","en":"🔥 Product of the Week","it":"🔥 Prodotto della Settimana","es":"🔥 Producto de la Semana"}',
};

const ALL_LOCALES = [
  { code: 'fr', label: '🇫🇷 Français', disabled: true },
  { code: 'en', label: '🇬🇧 English', disabled: false },
  { code: 'it', label: '🇮🇹 Italiano', disabled: false },
  { code: 'es', label: '🇪🇸 Español', disabled: false },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'general' | 'seo' | 'colors' | 'social' | 'menu'>('general');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings({ ...DEFAULT_SETTINGS, ...data });
  }
  useEffect(() => { load(); }, []);

  function set(key: string, value: any) {
    setSettings((s: any) => ({ ...s, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSettings({ ...DEFAULT_SETTINGS, ...data });
      showToast('✅ Paramètres sauvegardés');
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg text-sm animate-slide-in border border-gray-700">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">⚙️ Paramètres</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configuration globale du site</p>
        </div>
        <button onClick={save} disabled={saving} className="admin-btn-primary disabled:opacity-50">
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-800 rounded-xl p-1 overflow-x-auto">
        {([['general', '🏠 Général'], ['colors', '🎨 Couleurs'], ['seo', '🔍 SEO'], ['social', '🌐 Liens'], ['menu', '🍕 Menu']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t as any)}
            className={`flex-1 min-w-fit py-2 px-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ===== GENERAL ===== */}
      {tab === 'general' && (
        <div className="space-y-5">
          <div className="admin-card space-y-4">
            <h3 className="font-bold text-white">Identité</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nom du site</label>
                <input type="text" value={settings.siteName} onChange={e => set('siteName', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Slogan</label>
                <input type="text" value={settings.siteSlogan || ''} onChange={e => set('siteSlogan', e.target.value)} className="admin-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Téléphone</label>
                <input type="text" value={settings.phoneNumber || ''} onChange={e => set('phoneNumber', e.target.value)} className="admin-input" placeholder="+33 1 00 00 00 00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Langue par défaut</label>
                <select value={settings.defaultLanguage} onChange={e => set('defaultLanguage', e.target.value)} className="admin-input">
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="it">🇮🇹 Italiano</option>
                  <option value="es">🇪🇸 Español</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Adresse</label>
              <input type="text" value={settings.address || ''} onChange={e => set('address', e.target.value)} className="admin-input" placeholder="93 Rue Lecourbe, Paris 75015" />
            </div>
          </div>

          <div className="admin-card space-y-4">
            <h3 className="font-bold text-white">Page d'accueil</h3>
            <div className="grid grid-cols-2 gap-3">
              {[['linktree', '🔗 Linktree (défaut)'], ['menu', '🍕 Page Menu']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => set('homePage', val)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${settings.homePage === val ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                  <p className="font-semibold text-white text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{val === 'linktree' ? 'Page lien avec boutons' : 'Catalogue produits directement'}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="admin-card space-y-4">
            <h3 className="font-bold text-white">Médias</h3>
            <ImageUploader value={settings.logoUrl} onChange={url => set('logoUrl', url)} onRemove={() => set('logoUrl', '')} folder="brand" label="Logo (PNG transparent recommandé)" aspectRatio="aspect-square" />
            <ImageUploader value={settings.faviconUrl} onChange={url => set('faviconUrl', url)} onRemove={() => set('faviconUrl', '')} folder="brand" label="Favicon (.ico ou .png 32×32)" aspectRatio="aspect-square" />
          </div>

          <div className="admin-card space-y-4">
            <h3 className="font-bold text-white">Langues actives</h3>
            <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>Le Français est toujours actif. Désactivez les autres langues pour masquer le sélecteur.</p>
            <div className="space-y-2">
              {ALL_LOCALES.map(({ code, label, disabled }) => {
                const enabled: string[] = (() => { try { return JSON.parse(settings.enabledLocales || '[]'); } catch { return ['fr','en','it','es']; } })();
                const isChecked = enabled.includes(code);
                return (
                  <label key={code} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 cursor-pointer ${disabled ? 'opacity-50' : ''}`} style={{ background: 'var(--admin-surface-2)' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={e => {
                        const next = e.target.checked ? [...enabled, code] : enabled.filter((l: string) => l !== code);
                        set('enabledLocales', JSON.stringify(['fr', ...next.filter((l: string) => l !== 'fr')]));
                      }}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span className="text-sm" style={{ color: 'var(--admin-text)' }}>{label}</span>
                    {disabled && <span className="text-xs ml-auto" style={{ color: 'var(--admin-text-muted)' }}>Requis</span>}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== COLORS ===== */}
      {tab === 'colors' && (
        <div className="space-y-5">
          {/* Preset themes */}
          <div className="admin-card space-y-4">
            <h3 className="font-bold text-white">Thèmes prédéfinis</h3>
            <p className="text-xs text-gray-500">Cliquez sur un thème pour l'appliquer en un clic, puis personnalisez.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: '🔥 Woodiz (défaut)', primary: '#F59E0B', secondary: '#1F2937', accent: '#EF4444', bg: '#111827', text: '#FFFFFF' },
                { name: '🌊 Ocean Blue', primary: '#3B82F6', secondary: '#1E3A5F', accent: '#06B6D4', bg: '#0F172A', text: '#F0F9FF' },
                { name: '🌿 Forest Green', primary: '#10B981', secondary: '#1A2E1A', accent: '#84CC16', bg: '#0D1F0D', text: '#ECFDF5' },
                { name: '🍇 Purple Luxury', primary: '#8B5CF6', secondary: '#1E1B4B', accent: '#EC4899', bg: '#0D0B26', text: '#F5F3FF' },
                { name: '🌸 Rose Gold', primary: '#F43F5E', secondary: '#2D1B1B', accent: '#FB923C', bg: '#1C0A0A', text: '#FFF1F2' },
                { name: '🌙 Midnight', primary: '#6366F1', secondary: '#18181B', accent: '#A78BFA', bg: '#09090B', text: '#FAFAFA' },
                { name: '☀️ Soleil', primary: '#F59E0B', secondary: '#FEFCE8', accent: '#EF4444', bg: '#FFFBEB', text: '#1C1917' },
                { name: '🤍 Blanc Épuré', primary: '#18181B', secondary: '#F4F4F5', accent: '#3B82F6', bg: '#FFFFFF', text: '#09090B' },
              ].map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => {
                    set('primaryColor', theme.primary);
                    set('secondaryColor', theme.secondary);
                    set('accentColor', theme.accent);
                    set('backgroundColor', theme.bg);
                    set('textColor', theme.text);
                  }}
                  className="p-3 rounded-xl border border-gray-700 hover:border-gray-500 transition-all text-left group"
                  style={{ background: theme.bg }}
                >
                  <div className="flex gap-1.5 mb-2">
                    {[theme.primary, theme.accent, theme.secondary].map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: contrastColor(theme.bg) }}>{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div className="admin-card space-y-5">
            <h3 className="font-bold text-white">Personnalisation</h3>
            {[
              { key: 'primaryColor', label: 'Couleur principale (boutons, prix, accents)' },
              { key: 'secondaryColor', label: 'Couleur secondaire (fond cartes)' },
              { key: 'accentColor', label: 'Couleur d\'accentuation (badges, alertes)' },
              { key: 'backgroundColor', label: 'Fond général du site' },
              { key: 'textColor', label: 'Couleur de texte principale' },
            ].map(({ key, label }) => (
              <ColorPicker key={key} value={settings[key] || '#000000'} onChange={c => set(key, c)} label={label} />
            ))}
          </div>

          {/* Preview */}
          <div className="admin-card overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aperçu en direct</p>
            </div>
            <div className="p-5" style={{ backgroundColor: settings.backgroundColor }}>
              <p className="text-xs font-semibold mb-3 opacity-60" style={{ color: settings.textColor }}>Woodiz Paris 15</p>
              <div className="flex gap-2 flex-wrap">
                <button className="px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: settings.primaryColor, color: contrastColor(settings.primaryColor) }}>
                  Commander
                </button>
                <button className="px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: settings.accentColor, color: contrastColor(settings.accentColor) }}>
                  Nouveau
                </button>
                <div className="px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: settings.secondaryColor, color: contrastColor(settings.secondaryColor) }}>
                  Carte
                </div>
              </div>
              <p className="text-xs mt-3 opacity-70" style={{ color: settings.textColor }}>Pizza Margherita — <span style={{ color: settings.primaryColor }}>12,90 €</span></p>
            </div>
          </div>
        </div>
      )}

      {/* ===== SEO ===== */}
      {tab === 'seo' && (
        <div className="space-y-4">
          {/* SERP Preview */}
          <div className="admin-card">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Aperçu Google</p>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-[#1a0dab] text-lg font-medium truncate hover:underline cursor-pointer">
                {settings.metaTitle || settings.siteName || 'Titre de votre site'}
              </p>
              <p className="text-[#006621] text-sm">votre-site.vercel.app › menu</p>
              <p className="text-[#545454] text-sm mt-1 line-clamp-2">
                {settings.metaDescription || 'Description de votre site...'}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="admin-card space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-400">Titre SEO (balise title)</label>
                <span className={`text-xs font-bold ${(settings.metaTitle || '').length > 60 ? 'text-red-400' : (settings.metaTitle || '').length > 50 ? 'text-amber-400' : 'text-green-400'}`}>
                  {(settings.metaTitle || '').length}/60
                </span>
              </div>
              <input type="text" value={settings.metaTitle || ''} onChange={e => set('metaTitle', e.target.value)} className="admin-input" placeholder="Woodiz Paris 15 — Pizza artisanale au feu de bois" />
              <p className="text-xs text-gray-600 mt-1">Affiché dans l'onglet du navigateur et les résultats Google.</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-400">Description SEO (meta description)</label>
                <span className={`text-xs font-bold ${(settings.metaDescription || '').length > 160 ? 'text-red-400' : (settings.metaDescription || '').length > 140 ? 'text-amber-400' : 'text-green-400'}`}>
                  {(settings.metaDescription || '').length}/160
                </span>
              </div>
              <textarea value={settings.metaDescription || ''} onChange={e => set('metaDescription', e.target.value)} className="admin-input resize-none h-20" placeholder="Pizzeria artisanale au feu de bois à Paris 15. Pâte maison, ingrédients frais du marché. Commandez en ligne sur Uber Eats, Deliveroo..." />
              <p className="text-xs text-gray-600 mt-1">Résumé affiché sous le titre dans Google. Inclure des mots-clés.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Mots-clés (meta keywords)</label>
              <input type="text" value={settings.metaKeywords || ''} onChange={e => set('metaKeywords', e.target.value)} className="admin-input" placeholder="pizza, pizzeria, paris, artisanale, feu de bois, paris 15" />
              <p className="text-xs text-gray-600 mt-1">Séparés par des virgules. Impact limité sur Google, utile pour Bing.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">URL Canonique</label>
              <input type="url" value={settings.canonicalUrl || ''} onChange={e => set('canonicalUrl', e.target.value)} className="admin-input" placeholder="https://votre-site.vercel.app" />
              <p className="text-xs text-gray-600 mt-1">Évite le contenu dupliqué. Laisser vide pour utiliser l'URL par défaut.</p>
            </div>
          </div>

          {/* OG Image */}
          <div className="admin-card">
            <h4 className="font-semibold text-white mb-3">🖼️ Image de partage (Open Graph)</h4>
            <p className="text-xs text-gray-500 mb-3">Affichée quand le lien est partagé sur WhatsApp, Facebook, Twitter. Format recommandé : 1200×630px.</p>
            <ImageUploader value={settings.metaImageUrl} onChange={url => set('metaImageUrl', url)} onRemove={() => set('metaImageUrl', '')} folder="brand" label="Image sociale / OG (1200×630px recommandé)" />
          </div>

          {/* JSON-LD badge */}
          <div className="admin-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 text-xl">✅</div>
              <div>
                <p className="font-semibold text-white text-sm">Schema.org Restaurant activé</p>
                <p className="text-xs text-gray-500 mt-0.5">Données structurées JSON-LD automatiques : nom, adresse, horaires, menu. Améliore les rich snippets Google.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SOCIAL / LINKS ===== */}
      {tab === 'social' && (
        <div className="space-y-4">
        <div className="admin-card space-y-4">
          <h3 className="font-bold text-white">Réseaux & Liens utiles</h3>
          {[
            { key: 'googleMapsUrl', label: '📍 Google Maps URL', placeholder: 'https://maps.google.com/...' },
            { key: 'googleReviewsUrl', label: '⭐ Google Avis URL', placeholder: 'https://maps.google.com/.../reviews' },
            { key: 'instagramUrl', label: '📸 Instagram', placeholder: 'https://instagram.com/woodizparis' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
              <input type="url" value={settings[key] || ''} onChange={e => set(key, e.target.value)} className="admin-input" placeholder={placeholder} />
            </div>
          ))}
        </div>

        {/* Review Popup */}
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">⭐ Popup Avis Google</h3>
              <p className="text-xs text-gray-500 mt-0.5">Demande automatiquement un avis aux visiteurs</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.reviewPopupEnabled}
                onChange={e => set('reviewPopupEnabled', e.target.checked)}
                className="accent-amber-500 w-4 h-4"
              />
              <span className="text-sm text-white font-medium">Activer</span>
            </label>
          </div>

          {settings.reviewPopupEnabled && (
            <div className="space-y-3 pt-3 border-t border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Lien Google Avis</label>
                <input
                  type="url"
                  value={settings.googleReviewsUrl || ''}
                  onChange={e => set('googleReviewsUrl', e.target.value)}
                  className="admin-input"
                  placeholder="https://g.page/r/votre-établissement/review"
                />
                <p className="text-xs text-gray-600 mt-1">Trouvez votre lien dans Google Business Profile → Demander des avis.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Délai avant affichage</label>
                <div className="flex flex-wrap gap-2">
                  {[3, 5, 10, 20, 30].map(sec => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => set('reviewPopupDelay', sec)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${settings.reviewPopupDelay === sec ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1.5">Le popup ne réapparaît pas pendant 7 jours après fermeture.</p>
              </div>

              {/* Preview */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Aperçu</p>
                <div className="bg-white rounded-3xl overflow-hidden max-w-xs mx-auto" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                  <div className="h-1.5 w-full" style={{ background: settings.primaryColor || '#F59E0B' }} />
                  <div className="p-4 text-center">
                    <div className="flex justify-center gap-0.5 mb-2">
                      {[1,2,3,4,5].map(i => <span key={i} className="text-xl" style={{ color: settings.primaryColor || '#F59E0B' }}>★</span>)}
                    </div>
                    <p className="text-sm font-black text-gray-900 mb-0.5">Vous avez aimé ?</p>
                    <p className="text-xs text-gray-500 mb-3">Laissez-nous un avis Google, ça nous aide beaucoup !</p>
                    <div className="py-2 rounded-2xl text-white text-xs font-bold" style={{ background: settings.primaryColor || '#F59E0B' }}>
                      ⭐ Laisser un avis
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {tab === 'menu' && (
        <div className="space-y-4">
          {/* Featured section */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">⭐ Produits en Vedette</h3>
                <p className="text-xs text-gray-500 mt-0.5">Section affichée en haut du menu</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!settings.showFeatured} onChange={e => set('showFeatured', e.target.checked)} className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white font-medium">Afficher</span>
              </label>
            </div>
            {settings.showFeatured && (
              <div className="space-y-2 pt-2 border-t border-gray-700">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Titre de la section par langue</p>
                {[['fr','🇫🇷'],['en','🇬🇧'],['it','🇮🇹'],['es','🇪🇸']].map(([loc, flag]) => {
                  let titles: Record<string, string> = {};
                  try { titles = JSON.parse(settings.featuredTitles || '{}'); } catch {}
                  return (
                    <div key={loc} className="flex items-center gap-2">
                      <span className="text-sm w-6 flex-shrink-0">{flag}</span>
                      <input
                        type="text"
                        value={titles[loc] || ''}
                        onChange={e => {
                          const updated = { ...titles, [loc]: e.target.value };
                          set('featuredTitles', JSON.stringify(updated));
                        }}
                        className="admin-input text-sm"
                        placeholder={loc === 'fr' ? '⭐ Produits en Vedette' : loc === 'en' ? '⭐ Featured Products' : loc === 'it' ? '⭐ Prodotti in Evidenza' : '⭐ Productos Destacados'}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Week special section */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">🔥 Produit de la Semaine</h3>
                <p className="text-xs text-gray-500 mt-0.5">Section mise en avant hebdomadaire</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!settings.showWeekSpecial} onChange={e => set('showWeekSpecial', e.target.checked)} className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white font-medium">Afficher</span>
              </label>
            </div>
            {settings.showWeekSpecial && (
              <div className="space-y-2 pt-2 border-t border-gray-700">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Titre de la section par langue</p>
                {[['fr','🇫🇷'],['en','🇬🇧'],['it','🇮🇹'],['es','🇪🇸']].map(([loc, flag]) => {
                  let titles: Record<string, string> = {};
                  try { titles = JSON.parse(settings.weekTitles || '{}'); } catch {}
                  return (
                    <div key={loc} className="flex items-center gap-2">
                      <span className="text-sm w-6 flex-shrink-0">{flag}</span>
                      <input
                        type="text"
                        value={titles[loc] || ''}
                        onChange={e => {
                          const updated = { ...titles, [loc]: e.target.value };
                          set('weekTitles', JSON.stringify(updated));
                        }}
                        className="admin-input text-sm"
                        placeholder={loc === 'fr' ? '🔥 Produit de la Semaine' : loc === 'en' ? '🔥 Product of the Week' : loc === 'it' ? '🔥 Prodotto della Settimana' : '🔥 Producto de la Semana'}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button onClick={save} disabled={saving} className="w-full admin-btn-primary py-3 text-base disabled:opacity-50">
          {saving ? 'Sauvegarde en cours...' : '💾 Sauvegarder tous les paramètres'}
        </button>
      </div>
    </div>
  );
}
