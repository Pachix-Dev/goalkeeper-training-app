import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const FILENAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!FILENAME_PATTERN.test(filename)) {
    return new NextResponse('Invalid filename', { status: 400 });
  }

  const filePath = join(process.cwd(), 'public', 'designs', filename);

  try {
    const file = await readFile(filePath);
    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
