'use client';

import Image from 'next/image';

interface Props {
  settings: any;
}

export default function LinktreeCover({ settings }: Props) {
  if (!settings) return null;

  if (settings.coverType === 'video' && settings.coverVideoUrl) {
    return (
      <div className="w-full h-44 overflow-hidden relative">
        <video
          src={settings.coverVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
      </div>
    );
  }

  if (settings.coverType === 'image' && settings.coverImageUrl) {
    return (
      <div className="w-full h-44 overflow-hidden relative">
        <Image
          src={settings.coverImageUrl}
          alt="Cover"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
      </div>
    );
  }

  if (settings.coverType === 'color') {
    return (
      <div
        className="w-full h-32"
        style={{ background: settings.coverColor || '#1F2937' }}
      />
    );
  }

  return null;
}
