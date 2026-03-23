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
  onSelect: (id: number) => void;
  locale: string;
  primaryColor: string;
}

export default function CategoryTabs({ categories, active, onSelect, locale, primaryColor }: Props) {
  const hasImages = categories.some(c => c.iconUrl);

  if (hasImages) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
        {categories.map(cat => {
          const isActive = active === cat.id;
          const name = cat.translations[0]?.name || '—';
          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelect(cat.id);
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
                className="text-[11px] font-semibold text-center leading-tight max-w-[70px] break-words"
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
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => {
            onSelect(cat.id);
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
