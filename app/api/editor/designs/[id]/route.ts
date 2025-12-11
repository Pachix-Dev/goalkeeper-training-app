import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { TrainingDesignModel } from '@/lib/db/models/TrainingDesignModel';
import { updateDesignSchema } from '@/lib/validations/editor';
import { ZodError } from 'zod';

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
    const validated = updateDesignSchema.parse(body);
    const updated = await TrainingDesignModel.update(id, auth.id, validated);
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
