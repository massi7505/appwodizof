import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { prisma } from '@/lib/db';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '700', '900'],
  display: 'swap',
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return {
      title: settings?.metaTitle || settings?.siteName || 'Woodiz Paris 15',
      description: settings?.metaDescription || settings?.siteSlogan || 'Pizza artisanale au feu de bois',
      keywords: settings?.metaKeywords || 'pizza, pizzeria, paris, artisanale, feu de bois',
      icons: { icon: settings?.faviconUrl || '/favicon.ico' },
    };
  } catch {
    return { title: 'Woodiz Paris 15' };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-gray-950 text-white antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg focus:font-semibold focus:text-sm focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
