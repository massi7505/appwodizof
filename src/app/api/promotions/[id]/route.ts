import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { translations, id: _bodyId, ...data } = body;

    const promo = await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        promoPrice: data.promoPrice ? parseFloat(data.promoPrice) : null,
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        updatedAt: new Date(),
        ...(translations ? { translations: { deleteMany: {}, create: translations.map(({ id: _id, promotionId: _pid, ...t }: any) => t) } } : {}),
      },
      include: { translations: true },
    });
    return NextResponse.json(promo);
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await prisma.promotion.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
