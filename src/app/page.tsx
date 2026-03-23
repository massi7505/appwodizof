import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  let homePage = 'linktree';
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (settings?.homePage) homePage = settings.homePage;
  } catch {
    // fallback to linktree
  }
  redirect(homePage === 'menu' ? '/menu' : '/linktree');
}
