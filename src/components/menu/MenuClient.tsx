'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import MenuHeader from './MenuHeader';
import PromoSlider from './PromoSlider';
import CategoryTabs from './CategoryTabs';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import ReviewsSection from './ReviewsSection';
import FAQSection from './FAQSection';
import MenuFooter from './MenuFooter';
import GoogleReviewPopup from './GoogleReviewPopup';

interface Translation { locale: string; name: string; description?: string | null }
interface Product {
  id: number; slug: string; imageUrl?: string | null; price: any; comparePrice?: any;
  allergens?: string | null; badges?: string | null; isOutOfStock: boolean;
  isFeatured: boolean; isWeekSpecial: boolean; sortOrder: number;
  translations: Translation[];
}
interface Category {
  id: number; slug: string; iconUrl?: string | null; iconEmoji?: string | null;
  bgColor?: string | null; sortOrder: number;
  translations: Translation[];
  products: Product[];
}

interface Props {
  categories: Category[];
  promos: any[];
  reviews: any[];
  faqs: any[];
  site: any;
  locale: string;
}

const LABELS: Record<string, Record<string, string>> = {
  fr: { search: 'Rechercher une pizza...', featured: '⭐ Produits en Vedette', week: '🔥 Produit de la Semaine', menu: '🍕 Notre Carte', noResults: 'Aucun résultat pour', promos: 'Promotions du Moment', reviews: 'Ce que nos clients disent', faqs: 'Questions Fréquentes', viewGoogle: 'Voir tous les avis Google' },
  en: { search: 'Search a pizza...', featured: '⭐ Featured Products', week: '🔥 Product of the Week', menu: '🍕 Our Menu', noResults: 'No results for', promos: 'Current Promotions', reviews: "What our customers say", faqs: 'Frequently Asked Questions', viewGoogle: 'See all Google reviews' },
  it: { search: 'Cerca una pizza...', featured: '⭐ Prodotti in Evidenza', week: '🔥 Prodotto della Settimana', menu: '🍕 Il Nostro Menu', noResults: 'Nessun risultato per', promos: 'Promozioni del Momento', reviews: 'Cosa dicono i nostri clienti', faqs: 'Domande Frequenti', viewGoogle: 'Vedi tutte le recensioni Google' },
  es: { search: 'Buscar una pizza...', featured: '⭐ Productos Destacados', week: '🔥 Producto de la Semana', menu: '🍕 Nuestra Carta', noResults: 'Sin resultados para', promos: 'Promociones del Momento', reviews: 'Lo que dicen nuestros clientes', faqs: 'Preguntas Frecuentes', viewGoogle: 'Ver todas las reseñas de Google' },
};

export default function MenuClient({ categories, promos, reviews, faqs, site, locale }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(() => {
    if (site?.defaultCategoryId) return site.defaultCategoryId;
    return categories[0]?.id ?? null;
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategoryForModal] = useState<Category | null>(null);

  const L = LABELS[locale] || LABELS.fr;

  const primaryColor = site?.primaryColor || '#F59E0B';

  // Custom section titles from site settings
  const featuredTitle = (() => {
    try { return JSON.parse(site?.featuredTitles || '{}')[locale] || L.featured; } catch { return L.featured; }
  })();
  const weekTitle = (() => {
    try { return JSON.parse(site?.weekTitles || '{}')[locale] || L.week; } catch { return L.week; }
  })();
  const showFeatured = site?.showFeatured !== false;
  const showWeekSpecial = site?.showWeekSpecial !== false;

  // Featured products across all categories
  const featuredProducts = useMemo(() =>
    categories.flatMap(c => c.products.filter(p => p.isFeatured)),
    [categories]
  );
  const weekSpecials = useMemo(() =>
    categories.flatMap(c => c.products.filter(p => p.isWeekSpecial)),
    [categories]
  );

  // Filtered categories/products based on search + active category
  const filteredCategories = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return categories.map(cat => ({
        ...cat,
        products: cat.products.filter(p => {
          const t = p.translations[0];
          return t?.name.toLowerCase().includes(q) || t?.description?.toLowerCase().includes(q);
        }),
      })).filter(cat => cat.products.length > 0);
    }
    if (activeCategoryId !== null) {
      return categories.filter(c => c.id === activeCategoryId);
    }
    return categories;
  }, [categories, search, activeCategoryId]);

  const handleCategorySelect = (id: number) => {
    setActiveCategoryId(id);
  };

  const handleProductClick = useCallback((product: Product, category: Category) => {
    setSelectedProduct(product);
    setSelectedCategoryForModal(category);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ===== HEADER ===== */}
      <MenuHeader site={site} locale={locale} search={search} onSearch={setSearch} L={L} primaryColor={primaryColor} />

      {/* ===== PROMO SLIDER ===== */}
      {promos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <PromoSlider promos={promos} locale={locale} primaryColor={primaryColor} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pb-16">

        {/* ===== FEATURED ===== */}
        {showFeatured && featuredProducts.length > 0 && !search && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{featuredTitle}</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {featuredProducts.map(p => {
                const cat = categories.find(c => c.products.some(cp => cp.id === p.id));
                return (
                  <div key={p.id} className="flex-shrink-0 w-40">
                    <ProductCard
                      product={p}
                      locale={locale}
                      onClick={() => cat && handleProductClick(p, cat)}
                      compact
                      primaryColor={primaryColor}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== WEEK SPECIALS ===== */}
        {showWeekSpecial && weekSpecials.length > 0 && !search && (
          <section className="mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{weekTitle}</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {weekSpecials.map(p => {
                const cat = categories.find(c => c.products.some(cp => cp.id === p.id));
                return (
                  <div key={p.id} className="flex-shrink-0 w-40">
                    <ProductCard
                      product={p}
                      locale={locale}
                      onClick={() => cat && handleProductClick(p, cat)}
                      compact
                      primaryColor={primaryColor}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== CATEGORY TABS ===== */}
        <div className="sticky top-0 bg-gray-50 z-30 pt-4 pb-2 -mx-4 px-4">
          <CategoryTabs
            categories={categories}
            active={activeCategoryId}
            onSelect={handleCategorySelect}
            locale={locale}
            primaryColor={primaryColor}
          />
        </div>

        {/* ===== MAIN MENU SECTION ===== */}

        {search && (
          <p className="text-sm text-gray-500 mt-4 mb-3">
            {L.noResults} &ldquo;{search}&rdquo;...
          </p>
        )}

        {/* Products Grid */}
        {filteredCategories.map(cat => (
          <section key={cat.id} id={`cat-${cat.id}`} className="mt-6 scroll-mt-28">
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-4">
              {cat.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.iconUrl} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              ) : cat.iconEmoji ? (
                <span className="text-2xl">{cat.iconEmoji}</span>
              ) : null}
              <h3 className="text-base font-bold text-gray-900">
                {cat.translations[0]?.name || cat.slug}
              </h3>
              <span className="text-xs text-gray-400 font-medium ml-1">({cat.products.length})</span>
            </div>

            {cat.products.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">—</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {cat.products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    onClick={() => handleProductClick(product, cat)}
                    primaryColor={primaryColor}
                  />
                ))}
              </div>
            )}
          </section>
        ))}

        {/* ===== REVIEWS ===== */}
        {reviews.length > 0 && (
          <ReviewsSection reviews={reviews} site={site} locale={locale} L={L} primaryColor={primaryColor} />
        )}

        {/* ===== FAQS ===== */}
        {faqs.length > 0 && (
          <FAQSection faqs={faqs} locale={locale} L={L} />
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <MenuFooter site={site} locale={locale} />

      {/* ===== GOOGLE REVIEW POPUP ===== */}
      {site?.reviewPopupEnabled && site?.googleReviewsUrl && (
        <GoogleReviewPopup
          googleReviewsUrl={site.googleReviewsUrl}
          delay={site.reviewPopupDelay ?? 5}
          locale={locale}
          primaryColor={primaryColor}
        />
      )}

      {/* ===== PRODUCT MODAL ===== */}
      {selectedProduct && selectedCategory && (
        <ProductModal
          product={selectedProduct}
          category={selectedCategory}
          locale={locale}
          onClose={() => setSelectedProduct(null)}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
}
