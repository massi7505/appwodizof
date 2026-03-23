'use client';

import Image from 'next/image';

const ALLERGEN_ICONS: Record<string, string> = {
  gluten: '🌾', lactose: '🥛', eggs: '🥚', fish: '🐟', shellfish: '🦞',
  peanuts: '🥜', nuts: '🌰', celery: '🥬', mustard: '🌿', sesame: '🌱',
  sulfites: '🍷', lupin: '🌸', molluscs: '🦪', soya: '🫘', soy: '🫘',
};
const ALLERGEN_LABELS: Record<string, Record<string, string>> = {
  fr: { gluten:'Gluten', lactose:'Lactose', eggs:'Œufs', fish:'Poisson', shellfish:'Crustacés', peanuts:'Arachides', nuts:'Fruits à coque', celery:'Céleri', mustard:'Moutarde', sesame:'Sésame', sulfites:'Sulfites', lupin:'Lupin', molluscs:'Mollusques', soya:'Soja', soy:'Soja' },
  en: { gluten:'Gluten', lactose:'Lactose', eggs:'Eggs', fish:'Fish', shellfish:'Shellfish', peanuts:'Peanuts', nuts:'Tree Nuts', celery:'Celery', mustard:'Mustard', sesame:'Sesame', sulfites:'Sulphites', lupin:'Lupin', molluscs:'Molluscs', soya:'Soya', soy:'Soya' },
  it: { gluten:'Glutine', lactose:'Lattosio', eggs:'Uova', fish:'Pesce', shellfish:'Crostacei', peanuts:'Arachidi', nuts:'Frutta a guscio', celery:'Sedano', mustard:'Senape', sesame:'Sesamo', sulfites:'Solfiti', lupin:'Lupini', molluscs:'Molluschi', soya:'Soia', soy:'Soia' },
  es: { gluten:'Gluten', lactose:'Lactosa', eggs:'Huevos', fish:'Pescado', shellfish:'Mariscos', peanuts:'Cacahuetes', nuts:'Frutos secos', celery:'Apio', mustard:'Mostaza', sesame:'Sésamo', sulfites:'Sulfitos', lupin:'Altramuz', molluscs:'Moluscos', soya:'Soja', soy:'Soja' },
};

interface Product {
  id: number;
  imageUrl?: string | null;
  price: any;
  comparePrice?: any;
  allergens?: string | null;
  badges?: string | null;
  isOutOfStock: boolean;
  translations: { name: string; description?: string | null }[];
}

interface Props {
  product: Product;
  locale: string;
  onClick: () => void;
  compact?: boolean;
  primaryColor: string;
}

const BADGE_STYLES: Record<string, { bg: string; text: string; label: Record<string, string>; icon?: string }> = {
  bestseller: { bg: '#F59E0B', text: '#111', label: { fr: 'Bestseller', en: 'Bestseller', it: 'Bestseller', es: 'Más vendido' }, icon: '⭐' },
  nouveau:    { bg: '#10B981', text: '#fff', label: { fr: 'Nouveau', en: 'New', it: 'Nuovo', es: 'Nuevo' }, icon: '✨' },
  veggie:     { bg: '#059669', text: '#fff', label: { fr: 'Végétarien', en: 'Veggie', it: 'Vegetariano', es: 'Vegetariano' }, icon: '🌿' },
  piment:     { bg: '#DC2626', text: '#fff', label: { fr: 'Pimenté', en: 'Spicy', it: 'Piccante', es: 'Picante' }, icon: '🌶️' },
  halal:      { bg: '#16A34A', text: '#fff', label: { fr: 'Halal', en: 'Halal', it: 'Halal', es: 'Halal' }, icon: '☪️' },
  chef:       { bg: '#7C3AED', text: '#fff', label: { fr: "Chef's Choice", en: "Chef's Choice", it: 'Scelta Chef', es: 'Elección Chef' }, icon: '👨‍🍳' },
  classique:  { bg: '#3B82F6', text: '#fff', label: { fr: 'Classique', en: 'Classic', it: 'Classico', es: 'Clásico' } },
  partage:    { bg: '#F97316', text: '#fff', label: { fr: 'Partagé', en: 'Shared', it: 'Condiviso', es: 'Compartido' } },
};

const OUT_OF_STOCK: Record<string, string> = {
  fr: 'Rupture de stock', en: 'Out of stock', it: 'Esaurito', es: 'Agotado',
};

export default function ProductCard({ product, locale, onClick, compact = false, primaryColor }: Props) {
  const t = product.translations[0];
  const badges = product.badges ? JSON.parse(product.badges) : [];
  const firstBadge = badges[0];
  const badgeStyle = firstBadge ? BADGE_STYLES[firstBadge] : null;

  if (compact) {
    return (
      <button onClick={onClick} className="menu-card w-full text-left" disabled={product.isOutOfStock}>
        <div className="relative aspect-square">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={t?.name || ''} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl">🍕</div>
          )}
          {product.isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">{OUT_OF_STOCK[locale]}</span>
            </div>
          )}
          {badgeStyle && (
            <span
              className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
            >
              {badgeStyle.label[locale] || badgeStyle.label.fr}
            </span>
          )}
        </div>
        <div className="p-2">
          <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">{t?.name}</p>
          <p className="text-sm font-black text-gray-900 mt-1" style={{ color: primaryColor }}>
            {parseFloat(product.price).toFixed(2)}€
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="menu-card w-full text-left group"
      disabled={product.isOutOfStock}
    >
      {/* Image */}
      <div className="relative aspect-square">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={t?.name || ''}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-4xl">
            🍕
          </div>
        )}

        {/* Out of stock */}
        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {OUT_OF_STOCK[locale]}
            </span>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {badges.slice(0, 2).map((badge: string) => {
              const bs = BADGE_STYLES[badge];
              if (!bs) return null;
              return (
                <span
                  key={badge}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow flex items-center gap-0.5"
                  style={{ backgroundColor: bs.bg, color: bs.text }}
                >
                  {bs.icon && <span className="text-[11px]">{bs.icon}</span>}
                  {bs.label[locale] || bs.label.fr}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{t?.name}</h4>
        {t?.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-snug">{t.description}</p>
        )}

        {/* Allergens */}
        {product.allergens && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(JSON.parse(product.allergens) as string[]).map(a => (
              <span key={a} className="bg-orange-50 border border-orange-200 text-orange-700 text-[10px] rounded-lg px-2 py-0.5 flex items-center gap-1">
                <span>{ALLERGEN_ICONS[a] || '⚠️'}</span>
                <span>{(ALLERGEN_LABELS[locale] || ALLERGEN_LABELS.fr)[a] || a}</span>
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-2">
          {product.comparePrice && (
            <span className="text-xs text-gray-400 line-through">
              {parseFloat(product.comparePrice).toFixed(2)}€
            </span>
          )}
          <span className="text-base font-black" style={{ color: primaryColor }}>
            {parseFloat(product.price).toFixed(2)}€
          </span>
        </div>
      </div>
    </button>
  );
}
