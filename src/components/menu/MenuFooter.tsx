interface Props { site: any; locale: string; }

const FOOTER_COLS: Record<string, { menu: string; order: string; follow: string; }> = {
  fr: { menu: 'Notre Carte', order: 'Commander', follow: 'Nous suivre' },
  en: { menu: 'Our Menu', order: 'Order', follow: 'Follow us' },
  it: { menu: 'Il Menu', order: 'Ordinare', follow: 'Seguici' },
  es: { menu: 'Nuestra Carta', order: 'Pedir', follow: 'Síguenos' },
};

/** Darken a hex color by `amount` (0–1) for footer bg */
function darken(hex: string, amount = 0.18): string {
  const h = hex.replace('#', '');
  if (h.length < 6) return '#0a0a0a';
  const r = Math.max(0, Math.round(parseInt(h.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(h.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(h.slice(4, 6), 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

/** Mix a hex color toward black */
function footerBg(hex: string): string {
  // For very light backgrounds, use a dark neutral; otherwise darken the bg color
  const h = hex.replace('#', '');
  if (h.length < 6) return '#0f0f0f';
  const lum = (parseInt(h.slice(0,2),16)*0.299 + parseInt(h.slice(2,4),16)*0.587 + parseInt(h.slice(4,6),16)*0.114) / 255;
  return lum > 0.4 ? '#111827' : darken(hex, 0.15);
}

export default function MenuFooter({ site, locale }: Props) {
  const L = FOOTER_COLS[locale] || FOOTER_COLS.fr;
  const name = site?.siteName || 'Woodiz';
  const year = new Date().getFullYear();
  const primary = site?.primaryColor || '#F59E0B';
  const bg = footerBg(site?.backgroundColor || '#111827');
  // Border: primary at low opacity
  const borderStyle = `1px solid ${primary}18`;

  return (
    <footer style={{ backgroundColor: bg }} className="text-gray-400 mt-16">
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${primary}, transparent)` }} />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              {site?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={site.logoUrl} alt={name} className="w-9 h-9 rounded-xl object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-900 font-black text-lg"
                  style={{ backgroundColor: primary }}>
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-black text-white text-sm">{name}</p>
                {site?.siteSlogan && <p className="text-xs text-gray-500">{site.siteSlogan}</p>}
              </div>
            </div>
            {site?.address && <p className="text-xs leading-relaxed text-gray-500 mt-1">{site.address}</p>}
            {site?.phoneNumber && (
              <a href={`tel:${site.phoneNumber}`} className="text-xs mt-1.5 block font-medium hover:opacity-80 transition-opacity" style={{ color: primary }}>
                {site.phoneNumber}
              </a>
            )}
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">{L.menu}</h4>
            <div className="space-y-1.5 text-xs text-gray-500">
              <a href={locale === 'fr' ? '/menu' : `/${locale}/menu`} className="block hover:text-white transition-colors">Base Tomate</a>
              <a href={locale === 'fr' ? '/menu' : `/${locale}/menu`} className="block hover:text-white transition-colors">Base Crème</a>
              <a href={locale === 'fr' ? '/menu' : `/${locale}/menu`} className="block hover:text-white transition-colors">Boissons</a>
              <a href="/notre-histoire" className="block hover:text-white transition-colors">Notre Histoire</a>
            </div>
          </div>

          {/* Order */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">{L.order}</h4>
            <div className="space-y-1.5 text-xs text-gray-500">
              <a href="https://www.ubereats.com" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Uber Eats</a>
              <a href="https://www.deliveroo.fr" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Deliveroo</a>
              <a href="https://www.delicity.com" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Delicity</a>
            </div>
          </div>

          {/* Follow */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">{L.follow}</h4>
            <div className="space-y-1.5 text-xs text-gray-500">
              {site?.instagramUrl && (
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Instagram</a>
              )}
              {site?.googleMapsUrl && (
                <a href={site.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Google Maps</a>
              )}
              {site?.googleReviewsUrl && (
                <a href={site.googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Avis Google</a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 space-y-3" style={{ borderTop: borderStyle }}>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-gray-600">
            <a href="/legal/mentions-legales" className="hover:text-gray-300 transition-colors">Mentions légales</a>
            <a href="/legal/politique-confidentialite" className="hover:text-gray-300 transition-colors">Politique de confidentialité</a>
            <a href="/legal/politique-cookies" className="hover:text-gray-300 transition-colors">Politique de cookies</a>
            <a href="/legal/allergenes" className="hover:text-gray-300 transition-colors">Tableau des allergènes</a>
          </div>
          <p className="text-center text-xs text-gray-700">
            Pour votre santé, évitez de grignoter entre les repas.{' '}
            <a href="https://www.mangerbouger.fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-500 transition-colors">
              www.mangerbouger.fr
            </a>
          </p>
          <p className="text-center text-xs text-gray-700">
            © {year} {name}. Tous droits réservés. · Développé par{' '}
            <a href="/" className="font-medium hover:opacity-80 transition-opacity" style={{ color: primary }}>AdsBooster</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
