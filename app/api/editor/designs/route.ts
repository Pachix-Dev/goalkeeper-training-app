import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { TrainingDesignModel } from '@/lib/db/models/TrainingDesignModel';
import { createDesignSchema } from '@/lib/validations/editor';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const designs = await TrainingDesignModel.listByUser(auth.id);
    return NextResponse.json({ designs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const validated = createDesignSchema.parse(body);
    const created = await TrainingDesignModel.create(auth.id, validated);
    return NextResponse.json({ design: created }, { status: 201 });
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
