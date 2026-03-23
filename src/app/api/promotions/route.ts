import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale');
    const visible = searchParams.get('visible') !== 'false';
    const target = searchParams.get('target'); // 'linktree' | 'menu' | null

    const now = new Date();
    const promos = await prisma.promotion.findMany({
      where: {
        ...(visible ? { isVisible: true } : {}),
        ...(target === 'linktree' ? { showOnLinktree: true } : {}),
        ...(target === 'menu' ? { showOnMenu: true } : {}),
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: locale ? { where: { locale } } : true,
      },
    });
    return NextResponse.json(promos);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { translations, ...data } = body;

    const promo = await prisma.promotion.create({
      data: {
        ...data,
        promoPrice: data.promoPrice ? parseFloat(data.promoPrice) : null,
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        translations: { create: translations || [] },
      },
      include: { translations: true },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}
