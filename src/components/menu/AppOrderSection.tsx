import Image from 'next/image';

interface Props {
  site: any;
  locale: string;
  primaryColor: string;
  orderLinks?: { label: string; url: string }[];
}

const LABELS: Record<string, { title: string; subtitle: string; cta: string; tag: string }> = {
  fr: {
    tag: 'Commander en ligne',
    title: 'Commandez notre\nnourriture facilement',
    subtitle:
      'Retrouvez toute notre carte sur vos plateformes de livraison préférées et régalez-vous en quelques clics.',
    cta: 'Voir notre carte',
  },
  en: {
    tag: 'Order online',
    title: 'Order our food\neasily online',
    subtitle:
      'Find our full menu on your favourite delivery platforms and enjoy your meal in just a few clicks.',
    cta: 'View our menu',
  },
  it: {
    tag: 'Ordina online',
    title: 'Ordina il nostro\ncibo facilmente',
    subtitle:
      'Trova il nostro menu completo sulle tue piattaforme di consegna preferite e goditi il pasto in pochi clic.',
    cta: 'Vedi il menu',
  },
  es: {
    tag: 'Pedir online',
    title: 'Pide nuestra\ncomida fácilmente',
    subtitle:
      'Encuentra nuestro menú completo en tus plataformas de entrega favoritas y disfruta en pocos clics.',
    cta: 'Ver nuestra carta',
  },
};

const PLATFORM_ICONS: Record<string, string> = {
  deliveroo: '🛵',
  ubereats: '🚗',
  'uber eats': '🚗',
  justeat: '🍽️',
  'just eat': '🍽️',
};

function platformIcon(label: string): string {
  const key = label.toLowerCase();
  for (const [k, v] of Object.entries(PLATFORM_ICONS)) {
    if (key.includes(k)) return v;
  }
  return '📱';
}

export default function AppOrderSection({ site, locale, primaryColor, orderLinks = [] }: Props) {
  const L = LABELS[locale] || LABELS.fr;

  return (
    <section className="mt-16 relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
      {/* Ambient glows */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ backgroundColor: primaryColor, opacity: 0.07, filter: 'blur(72px)' }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ backgroundColor: primaryColor, opacity: 0.05, filter: 'blur(60px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* ── Text side ── */}
          <div>
            <span
              className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
              style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
            >
              {L.tag}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5 whitespace-pre-line">
              {L.title}
            </h2>

            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-md">{L.subtitle}</p>

            {/* Platform buttons */}
            <div className="flex flex-wrap gap-3">
              {orderLinks.length > 0
                ? orderLinks.slice(0, 3).map(link => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-5 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:scale-105 hover:shadow-xl"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <span>{platformIcon(link.label)}</span>
                      {link.label}
                    </a>
                  ))
                : (
                  <a
                    href="/menu"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105 hover:shadow-xl"
                    style={{ backgroundColor: primaryColor, color: '#111827' }}
                  >
                    {L.cta}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
            </div>
          </div>

          {/* ── Image side ── */}
          <div className="flex justify-center md:justify-end">
            {site?.heroImageUrl ? (
              <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl">
                <Image src={site.heroImageUrl} alt="" fill className="object-cover" />
              </div>
            ) : site?.logoUrl ? (
              <div
                className="w-64 h-64 md:w-72 md:h-72 rounded-3xl flex items-center justify-center shadow-2xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Image src={site.logoUrl} alt={site?.siteName || ''} width={160} height={160} className="object-contain" />
              </div>
            ) : (
              /* Decorative food grid when no image */
              <div className="grid grid-cols-2 gap-3">
                {['🍕', '🍔', '🥗', '🍟'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-32 h-32 md:w-36 md:h-36 rounded-2xl flex items-center justify-center text-5xl"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.09)',
                    }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
