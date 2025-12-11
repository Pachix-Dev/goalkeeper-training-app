import { NextRequest, NextResponse } from 'next/server';
import { PenaltyModel } from '@/lib/db/models/PenaltyModel';
import { requireAuth } from '@/lib/auth/middleware';
import { createPenaltySchema } from '@/lib/validations/penalty';
import { ZodError } from 'zod';

// GET /api/penalties - Obtener penaltis
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const goalkeeperId = searchParams.get('goalkeeper_id');
    const kicker = searchParams.get('kicker');

    if (goalkeeperId) {
      const limit = searchParams.get('limit');
      const penalties = await PenaltyModel.findByGoalkeeper(
        parseInt(goalkeeperId),
        limit ? parseInt(limit) : undefined
      );
      return NextResponse.json(penalties);
    }

    if (kicker) {
      const penalties = await PenaltyModel.findByKicker(user.id, kicker);
      return NextResponse.json(penalties);
    }

    const penalties = await PenaltyModel.findByUser(user.id);
    return NextResponse.json(penalties);
  } catch (error) {
    console.error('Error fetching penalties:', error);
    return NextResponse.json(
      { error: 'Error al obtener penaltis' },
      { status: 500 }
    );
  }
});

// POST /api/penalties - Registrar penalti
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    
    // Validar con Zod
    const validatedData = createPenaltySchema.parse(body);

    const penalty = await PenaltyModel.create({
      ...validatedData,
      created_by: user.id,
    });

    return NextResponse.json(penalty, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating penalty:', error);
    return NextResponse.json(
      { error: 'Error al registrar penalti' },
      { status: 500 }
    );
  }
});
