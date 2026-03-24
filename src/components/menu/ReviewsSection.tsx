'use client';

import { useState } from 'react';

// ===== REVIEWS SECTION =====
interface Review {
  id: number; authorName: string; authorInitial?: string | null;
  avatarColor: string; rating: number; text: string; source: string; date: any;
}

interface ReviewsProps {
  reviews: Review[];
  site: any;
  locale: string;
  L: Record<string, string>;
  primaryColor: string;
}

function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill={s <= rating ? color : '#E5E7EB'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ensureUrl(url: string): string {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function ReviewsSection({ reviews, site, locale, L, primaryColor }: ReviewsProps) {
  const calcAvg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const displayRating = site?.googleRating ?? (reviews.length ? calcAvg : 0);
  const displayCount = site?.googleReviewCount ?? reviews.length;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{L.reviews}</h2>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={Math.round(displayRating)} color={primaryColor} />
            <span className="text-sm font-bold text-gray-700">{displayRating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({displayCount} avis)</span>
          </div>
        </div>
        {site?.googleReviewsUrl && (
          <a
            href={ensureUrl(site.googleReviewsUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {L.viewGoogle}
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: review.avatarColor }}
              >
                {review.authorInitial || review.authorName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{review.authorName}</p>
                <p className="text-xs text-gray-400">
                  {new Date(review.date).toLocaleDateString(locale, { year: 'numeric', month: 'short' })}
                </p>
              </div>
              {review.source === 'google' && (
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
            </div>
            <StarRating rating={review.rating} color={primaryColor} />
            <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-4">{review.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== FAQ SECTION =====
interface FAQProps {
  faqs: any[];
  locale: string;
  L: Record<string, string>;
}

export function FAQSection({ faqs, locale, L }: FAQProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section className="mt-12">
      <h2 className="text-lg font-bold text-gray-900 mb-5">{L.faqs}</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {faqs.map(faq => {
          const t = faq.translations[0];
          if (!t) return null;
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id}>
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">{t.question}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: isOpen ? '400px' : '0px' }}
              >
                <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{t.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ReviewsSection;
