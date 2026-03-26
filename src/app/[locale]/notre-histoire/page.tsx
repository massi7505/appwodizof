import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import StoryPageView from '@/components/story/StoryPageView';
import type { Metadata } from 'next';

export const revalidate = 30;
const LOCALES = ['en', 'it', 'es'];

function tJson(json: string | null | undefined, locale: string, fallback = ''): string {
  if (!json) return fallback;
  try { const o = JSON.parse(json); return o[locale] || o.fr || fallback; } catch { return fallback; }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const p = prisma as any;
  const page = await p.storyPage.findFirst().catch(() => null);
  const title = tJson(page?.seoTitleJson, locale, 'Our Story');
  const desc = tJson(page?.seoDescJson, locale, '');
  return { title, description: desc, openGraph: { title, description: desc } };
}

export default async function LocaleNotrePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) redirect('/notre-histoire');
  const p = prisma as any;
  const [page, site] = await Promise.all([
    p.storyPage.findFirst({ include: { sections: { where: { isVisible: true }, orderBy: { sortOrder: 'asc' } } } }).catch(() => null),
    p.siteSettings.findFirst().catch(() => null),
  ]);
  if (!page?.isVisible) return <div className="min-h-screen flex items-center justify-center text-gray-400">Page unavailable</div>;
  return <StoryPageView page={page} locale={locale} site={site} />;
}
