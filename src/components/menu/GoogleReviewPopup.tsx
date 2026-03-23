'use client';

import { useState, useEffect } from 'react';

const LABELS: Record<string, { title: string; subtitle: string; cta: string; later: string }> = {
  fr: { title: 'Vous avez aimé ?', subtitle: 'Laissez-nous un avis Google, ça nous aide beaucoup !', cta: '⭐ Laisser un avis', later: 'Plus tard' },
  en: { title: 'Did you enjoy it?', subtitle: 'Leave us a Google review, it helps us a lot!', cta: '⭐ Leave a review', later: 'Later' },
  it: { title: 'Vi è piaciuto?', subtitle: 'Lasciateci una recensione su Google, ci aiuta molto!', cta: '⭐ Lascia una recensione', later: 'Più tardi' },
  es: { title: '¿Te gustó?', subtitle: '¡Déjanos una reseña en Google, nos ayuda mucho!', cta: '⭐ Dejar una reseña', later: 'Más tarde' },
};

const STORAGE_KEY = 'woodiz_review_popup_dismissed';
const COOLDOWN_DAYS = 7;

interface Props {
  googleReviewsUrl: string;
  delay: number;
  locale: string;
  primaryColor?: string;
}

export default function GoogleReviewPopup({ googleReviewsUrl, delay, locale, primaryColor = '#F59E0B' }: Props) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && Date.now() - parseInt(stored) < COOLDOWN_DAYS * 24 * 3600 * 1000) return;
    } catch {}

    const timer = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  function dismiss() {
    setClosing(true);
    try { localStorage.setItem(STORAGE_KEY, Date.now().toString()); } catch {}
    setTimeout(() => setVisible(false), 300);
  }

  function openReview() {
    window.open(googleReviewsUrl, '_blank', 'noopener');
    dismiss();
  }

  if (!visible) return null;

  const L = LABELS[locale] || LABELS.fr;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 pointer-events-none"
      style={{ paddingBottom: '1.5rem' }}
    >
      <div
        className={`pointer-events-auto w-full max-w-sm transition-all duration-300 ${closing ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
          {/* Top bar */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}cc)` }} />

          <div className="p-5">
            {/* Close button */}
            <div className="flex justify-end mb-1">
              <button
                onClick={dismiss}
                className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Stars decoration */}
            <div className="flex justify-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-2xl" style={{ color: primaryColor }}>★</span>
              ))}
            </div>

            <h3 className="text-center text-base font-black text-gray-900 mb-1">{L.title}</h3>
            <p className="text-center text-sm text-gray-500 mb-4 leading-snug">{L.subtitle}</p>

            <button
              onClick={openReview}
              className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{ backgroundColor: primaryColor, color: '#fff' }}
            >
              {L.cta}
            </button>

            <button
              onClick={dismiss}
              className="w-full py-2 mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium"
            >
              {L.later}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
