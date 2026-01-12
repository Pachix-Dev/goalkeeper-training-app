import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { TrainingDesignModel } from '@/lib/db/models/TrainingDesignModel';
import { createDesignSchema } from '@/lib/validations/editor';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const designs = await TrainingDesignModel.listByUser(Number(auth.id));
    return NextResponse.json({ designs });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const authUserId = Number(auth.id);
    const body = await req.json();
    
    // Extraer la imagen si existe
    const { imageDataUrl, ...designData } = body;
    let imgFilename: string | undefined;
    
    if (imageDataUrl) {
      // Generar UUID para el nombre del archivo
      imgFilename = `${randomUUID()}.png`;
      const publicPath = join(process.cwd(), 'public', 'designs', imgFilename);
      
      // Convertir base64 a buffer
      const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Guardar archivo
      await writeFile(publicPath, buffer);
    }
    
    const validated = createDesignSchema.parse(designData);
    const created = await TrainingDesignModel.create(authUserId, {
      ...validated,
      img: imgFilename
    });
    
    return NextResponse.json({ design: created }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
    }
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
