'use client';

interface Props {
  bar: {
    isVisible?: boolean;
    bgColor: string;
    textColor: string;
    icon?: string | null;
    link?: string | null;
    linkLabel?: string | null;
    translations: { locale: string; text: string }[];
  };
  locale: string;
}

export function NotificationBarComponent({ bar, locale }: Props) {
  // Find translation for current locale, fallback to 'fr', then first available
  const t =
    bar.translations.find(x => x.locale === locale && x.text) ||
    bar.translations.find(x => x.locale === 'fr' && x.text) ||
    bar.translations.find(x => x.text);

  if (!t?.text) return null;

  const inner = (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-center w-full"
      style={{ backgroundColor: bar.bgColor, color: bar.textColor }}
    >
      {bar.icon && <span>{bar.icon}</span>}
      <span>{t.text}</span>
      {bar.link && bar.linkLabel && (
        <span className="font-bold underline ml-1 opacity-90">{bar.linkLabel} →</span>
      )}
    </div>
  );

  if (bar.link) {
    return (
      <a href={bar.link} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

export default NotificationBarComponent;
