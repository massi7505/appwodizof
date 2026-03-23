'use client';

interface Category {
  id: number;
  iconEmoji?: string | null;
  iconUrl?: string | null;
  translations: { name: string }[];
}

interface Props {
  categories: Category[];
  active: number | null;
  onSelect: (id: number | null) => void;
  locale: string;
  primaryColor: string;
}

const ALL_LABELS: Record<string, string> = {
  fr: 'Toutes', en: 'All', it: 'Tutte', es: 'Todas',
};

export default function CategoryTabs({ categories, active, onSelect, locale, primaryColor }: Props) {
  // Determine if any category has an iconUrl — use icon style if so
  const hasImages = categories.some(c => c.iconUrl);

  if (hasImages) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
        {/* "All" circle */}
        <button
          onClick={() => onSelect(null)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 border-2"
            style={{
              borderColor: active === null ? primaryColor : '#E5E7EB',
              background: active === null ? primaryColor + '15' : '#F3F4F6',
              color: active === null ? primaryColor : '#6B7280',
              boxShadow: active === null ? `0 0 0 2px ${primaryColor}` : 'none',
            }}
          >
            {ALL_LABELS[locale] || ALL_LABELS.fr}
          </div>
          <span
            className="text-[11px] font-semibold text-center leading-tight max-w-[60px] truncate"
            style={{ color: active === null ? primaryColor : '#6B7280' }}
          >
            {ALL_LABELS[locale] || ALL_LABELS.fr}
          </span>
        </button>

        {categories.map(cat => {
          const isActive = active === cat.id;
          const name = cat.translations[0]?.name || '—';
          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelect(isActive ? null : cat.id);
                const el = document.getElementById(`cat-${cat.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
            >
              <div
                className="w-14 h-14 rounded-full overflow-hidden transition-all duration-200 border-2"
                style={{
                  borderColor: isActive ? primaryColor : 'transparent',
                  boxShadow: isActive ? `0 0 0 2px ${primaryColor}` : '0 1px 4px rgba(0,0,0,0.10)',
                }}
              >
                {cat.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.iconUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">
                    {cat.iconEmoji || '🍽️'}
                  </div>
                )}
              </div>
              <span
                className="text-[11px] font-semibold text-center leading-tight max-w-[60px] truncate"
                style={{ color: isActive ? primaryColor : '#374151' }}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Fallback: pill style (no images)
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`category-pill flex-shrink-0 ${active === null ? 'active' : 'inactive'}`}
        style={active === null ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#111' } : {}}
      >
        {ALL_LABELS[locale] || ALL_LABELS.fr}
      </button>

      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => {
            onSelect(active === cat.id ? null : cat.id);
            const el = document.getElementById(`cat-${cat.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className={`category-pill flex-shrink-0 ${active === cat.id ? 'active' : 'inactive'}`}
          style={active === cat.id ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#111' } : {}}
        >
          {cat.iconEmoji && <span className="flex-shrink-0">{cat.iconEmoji}</span>}
          {cat.translations[0]?.name || '—'}
        </button>
      ))}
    </div>
  );
}
