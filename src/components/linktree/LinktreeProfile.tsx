'use client';

import Image from 'next/image';

interface Props {
  settings: any;
  site: any;
}

export default function LinktreeProfile({ settings, site }: Props) {
  const name = settings?.profileName || site?.siteName || 'Woodiz Paris 15';
  const subtitle = settings?.profileSubtitle || site?.siteSlogan || '';

  return (
    <div className="flex flex-col items-center px-6 pt-6 pb-2">
      {/* Logo/Avatar */}
      {settings?.profileImageUrl && (
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 shadow-lg mb-4 -mt-10 relative z-10 bg-gray-800">
          <Image
            src={settings.profileImageUrl}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Name */}
      <h1 className="font-display text-2xl font-bold text-white text-center">
        {name}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-gray-400 text-sm mt-1 text-center">{subtitle}</p>
      )}

      {/* Notice */}
      {settings?.noticeText && (
        <div className="mt-4 w-full bg-gray-800/80 rounded-2xl p-4 flex gap-3 items-start border border-gray-700">
          {settings.noticeIcon && (
            <span className="text-2xl flex-shrink-0">{settings.noticeIcon}</span>
          )}
          <p className="text-gray-300 text-sm leading-relaxed">{settings.noticeText}</p>
        </div>
      )}
    </div>
  );
}
