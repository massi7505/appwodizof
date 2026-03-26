import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSessionFromReq } from '@/lib/auth';
import sharp from 'sharp';

// Max dimension per folder type
const MAX_DIM: Record<string, number> = {
  menu: 800,
  og: 1200,
  logo: 512,
  default: 1200,
};

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = [...IMAGE_TYPES, 'image/x-icon', 'image/vnd.microsoft.icon', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 });
    }

    let uploadBuffer: Buffer | ArrayBuffer;
    let contentType = file.type;
    let ext = file.name.split('.').pop() || 'bin';

    // Resize raster images with sharp (skip GIF, ICO, videos)
    if (IMAGE_TYPES.includes(file.type) && file.type !== 'image/gif') {
      const maxDim = MAX_DIM[folder] ?? MAX_DIM.default;
      const inputBuffer = Buffer.from(await file.arrayBuffer());
      uploadBuffer = await sharp(inputBuffer)
        .resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      contentType = 'image/webp';
      ext = 'webp';
    } else {
      uploadBuffer = await file.arrayBuffer();
    }

    const filename = `${folder}/${Date.now()}-${crypto.randomUUID().replace(/-/g, '')}.${ext}`;
    const blob = await put(filename, uploadBuffer, { access: 'public', contentType, token: process.env.BLOB_READ_WRITE_TOKEN });

    return NextResponse.json({ url: blob.url, contentType: blob.contentType });
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
