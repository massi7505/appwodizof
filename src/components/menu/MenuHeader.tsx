'use client';

import Image from 'next/image';
import { SearchIcon, CloseIcon } from '@/components/ui/icons';

interface Props {
  site: any;
  locale: string;
  search: string;
  onSearch: (v: string) => void;
  L: Record<string, string>;
  primaryColor: string;
}

const ALL_LOCALES = ['fr', 'en', 'it', 'es'];

export default function MenuHeader({ site, locale, search, onSearch, L, primaryColor }: Props) {
  const enabledLocales: string[] = (() => {
    try { return JSON.parse(site?.enabledLocales || '["fr","en","it","es"]'); } catch { return ALL_LOCALES; }
  })();
  const visibleLocales = ALL_LOCALES.filter(l => enabledLocales.includes(l));

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {site?.logoUrl ? (
            <Image src={site.logoUrl} alt={site.siteName} width={36} height={36} className="rounded-lg object-contain" />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-900 font-black text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              W
            </div>
          )}
          <div className="hidden sm:block">
            <p className="font-black text-gray-900 text-sm leading-none">{site?.siteName || 'Woodiz'}</p>
            {site?.siteSlogan && (
              <p className="text-xs text-gray-400 leading-none mt-0.5">{site.siteSlogan}</p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder={L.search}
            aria-label={L.search}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': primaryColor } as any}
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Language Switcher — after search */}
        {visibleLocales.length > 1 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {visibleLocales.map(l => (
              <a
                key={l}
                href={l === 'fr' ? '/menu' : `/${l}/menu`}
                className={`text-xs font-bold px-1.5 py-0.5 rounded transition-colors ${
                  locale === l ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'
                }`}
                style={locale === l ? { color: primaryColor } : {}}
              >
                {l.toUpperCase()}
              </a>
            ))}
          </div>
        )}

      </div>
    </header>
  );
}
