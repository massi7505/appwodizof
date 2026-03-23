'use client';

interface Props {
  settings: any;
  site: any;
}

export default function LinktreeProfile({ settings, site }: Props) {
  const name = settings?.profileName || site?.siteName || 'Woodiz Paris 15';
  const subtitle = settings?.profileSubtitle || site?.siteSlogan || '';

  return (
    <div className="flex flex-col items-center px-6 pt-16 pb-2">
      {/* Name */}
      <h1 className="font-display text-2xl font-bold text-white text-center leading-tight">
        {name}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-white/50 text-sm mt-1 text-center">{subtitle}</p>
      )}

      {/* Notice */}
      {settings?.noticeText && (
        <div className="mt-5 w-full rounded-2xl p-4 flex gap-3 items-start border border-white/10"
          style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
          {settings.noticeIcon && (
            <span className="text-xl flex-shrink-0 mt-0.5">{settings.noticeIcon}</span>
          )}
          <p className="text-white/70 text-sm leading-relaxed">{settings.noticeText}</p>
        </div>
      )}
    </div>
  );
}
