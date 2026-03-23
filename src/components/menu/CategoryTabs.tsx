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
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {/* "All" pill */}
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
            // Scroll to section
            const el = document.getElementById(`cat-${cat.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className={`category-pill flex-shrink-0 ${active === cat.id ? 'active' : 'inactive'}`}
          style={active === cat.id ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#111' } : {}}
        >
          {cat.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cat.iconUrl} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
          ) : cat.iconEmoji ? (
            <span className="flex-shrink-0">{cat.iconEmoji}</span>
          ) : null}
          {cat.translations[0]?.name || '—'}
        </button>
      ))}
    </div>
  );
}
