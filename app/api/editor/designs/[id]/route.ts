import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { TrainingDesignModel } from '@/lib/db/models/TrainingDesignModel';
import { updateDesignSchema } from '@/lib/validations/editor';
import { ZodError } from 'zod';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

interface Params { id: string }

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);    
    const design = await TrainingDesignModel.findById(id);
    if (design.user_id !== auth.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ design });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const body = await req.json();
    
    // Extraer la imagen si existe
    const { imageDataUrl, ...designData } = body;
    let imgFilename: string | undefined;
    
    if (imageDataUrl) {
      // Obtener el diseño actual para eliminar la imagen anterior si existe
      const currentDesign = await TrainingDesignModel.findById(id);
      if (currentDesign.user_id !== auth.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      // Eliminar imagen anterior si existe
      if (currentDesign.img) {
        const oldImagePath = join(process.cwd(), 'public', 'designs', currentDesign.img);
        try {
          await unlink(oldImagePath);
        } catch (err) {
          // Si no se puede eliminar, continuar
          console.error('Error deleting old image:', err);
        }
      }
      
      // Generar UUID para el nombre del archivo
      imgFilename = `${randomUUID()}.png`;
      const publicPath = join(process.cwd(), 'public', 'designs', imgFilename);
      
      // Convertir base64 a buffer
      const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Guardar archivo
      await writeFile(publicPath, buffer);
    }
    
    const validated = updateDesignSchema.parse(designData);
    const updated = await TrainingDesignModel.update(id, auth.id, {
      ...validated,
      img: imgFilename
    });
    
    return NextResponse.json({ design: updated });
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
    }
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    await TrainingDesignModel.delete(id, auth.id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
