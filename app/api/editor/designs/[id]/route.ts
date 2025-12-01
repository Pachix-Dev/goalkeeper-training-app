import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { TrainingDesignModel } from '@/lib/db/models/TrainingDesignModel';
import { updateDesignSchema } from '@/lib/validations/editor';

interface Params { id: string }

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = parseInt(params.id, 10);
    const design = await TrainingDesignModel.findById(id);
    if (design.user_id !== auth.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ design });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = parseInt(params.id, 10);
    const body = await req.json();
    const validated = updateDesignSchema.parse(body);
    const updated = await TrainingDesignModel.update(id, auth.user.id, validated);
    return NextResponse.json({ design: updated });
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = parseInt(params.id, 10);
    await TrainingDesignModel.delete(id, auth.user.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
