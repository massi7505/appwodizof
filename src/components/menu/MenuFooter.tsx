interface Props { site: any; locale: string; }

const FOOTER_COLS: Record<string, { contact: string; menu: string; order: string; follow: string; }> = {
  fr: { contact: 'Contact & Horaires', menu: 'Notre Carte', order: 'Commander', follow: 'Nous suivre' },
  en: { contact: 'Contact & Hours', menu: 'Our Menu', order: 'Order', follow: 'Follow us' },
  it: { contact: 'Contatto & Orari', menu: 'Il Menu', order: 'Ordinare', follow: 'Seguici' },
  es: { contact: 'Contacto & Horarios', menu: 'Nuestra Carta', order: 'Pedir', follow: 'Síguenos' },
};

export default function MenuFooter({ site, locale }: Props) {
  const L = FOOTER_COLS[locale] || FOOTER_COLS.fr;
  const name = site?.siteName || 'Woodiz';
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-gray-900 font-black text-lg">W</div>
              <div>
                <p className="font-black text-white text-sm">{name}</p>
                {site?.siteSlogan && <p className="text-xs text-gray-500">{site.siteSlogan}</p>}
              </div>
            </div>
            {site?.address && <p className="text-xs leading-relaxed">{site.address}</p>}
            {site?.phoneNumber && <p className="text-xs mt-1 text-amber-400">{site.phoneNumber}</p>}
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">{L.menu}</h4>
            <div className="space-y-1 text-xs">
              <a href={locale === 'fr' ? '/menu' : `/${locale}/menu`} className="block hover:text-white transition-colors">Base Tomate</a>
              <a href={locale === 'fr' ? '/menu' : `/${locale}/menu`} className="block hover:text-white transition-colors">Base Crème</a>
              <a href={locale === 'fr' ? '/menu' : `/${locale}/menu`} className="block hover:text-white transition-colors">Boissons</a>
            </div>
          </div>

          {/* Order */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">{L.order}</h4>
            <div className="space-y-1 text-xs">
              <a href="https://www.ubereats.com" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Uber Eats</a>
              <a href="https://www.deliveroo.fr" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Deliveroo</a>
              <a href="https://www.delicity.com" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Delicity</a>
            </div>
          </div>

          {/* Follow */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">{L.follow}</h4>
            <div className="space-y-1 text-xs">
              {site?.instagramUrl && (
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Instagram</a>
              )}
              {site?.googleMapsUrl && (
                <a href={site.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Google Maps</a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-xs text-center text-gray-600">
          © {year} {name}. Tous droits réservés. · Développé par{' '}
          <a href="/" className="text-amber-500 hover:text-amber-400">AdsBooster</a>
        </div>
      </div>
    </footer>
  );
}
