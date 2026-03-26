import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export const revalidate = 3600; // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = 'https://woodiz.fr';
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (settings?.canonicalUrl) baseUrl = settings.canonicalUrl.replace(/\/$/, '');
  } catch {}

  const now = new Date();
  const locales = ['en', 'it', 'es'];

  const pages = [
    { path: '/linktree',       priority: 1.0, changeFreq: 'daily'   as const },
    { path: '/menu',           priority: 0.9, changeFreq: 'weekly'  as const },
    { path: '/notre-histoire', priority: 0.6, changeFreq: 'monthly' as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    // French (default, no locale prefix)
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFreq,
      priority: page.priority,
    });
    // Other locales
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFreq,
        priority: Math.round(page.priority * 0.85 * 100) / 100,
      });
    }
  }

  return entries;
}
