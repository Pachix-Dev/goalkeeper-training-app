import { NextRequest, NextResponse } from 'next/server';
import { TrainingSessionModel } from '@/lib/db/models/TrainingSessionModel';
import { requireAuth } from '@/lib/auth/middleware';
import { createSessionSchema } from '@/lib/validations/session';
import { ZodError } from 'zod';

// GET /api/sessions - Obtener sesiones
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const upcoming = searchParams.get('upcoming') === 'true';

    let sessions;

    if (upcoming) {
      const limit = parseInt(searchParams.get('limit') || '10');
      sessions = await TrainingSessionModel.findUpcoming(user.id, limit);
    } else if (startDate && endDate) {
      sessions = await TrainingSessionModel.findByDateRange(
        user.id,
        startDate,
        endDate,
        teamId ? parseInt(teamId) : undefined
      );
    } else if (teamId) {
      sessions = await TrainingSessionModel.findByTeam(parseInt(teamId), user.id);
    } else {
      sessions = await TrainingSessionModel.findByUser(user.id);
    }

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Error al obtener sesiones' },
      { status: 500 }
    );
  }
});

// POST /api/sessions - Crear sesión
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    
    // Validar con Zod
    const validatedData = createSessionSchema.parse(body);

    const session = await TrainingSessionModel.create({
      ...validatedData,
      user_id: user.id,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Error al crear sesión' },
      { status: 500 }
    );
  }
});
