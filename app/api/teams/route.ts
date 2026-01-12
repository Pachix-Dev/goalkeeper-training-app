import { NextRequest, NextResponse } from 'next/server';
import { TeamModel } from '@/lib/db/models/TeamModel';
import { requireAuth } from '@/lib/auth/middleware';
import { createTeamSchema } from '@/lib/validations/team';
import { json, ZodError } from 'zod';
import { checkResourceLimit } from '@/lib/auth/subscriptionMiddleware';

// GET /api/teams - Obtener equipos del usuario
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');

    let teams;
    if (season) {
      teams = await TeamModel.findBySeason(Number(user.id), season);
    } else {
      teams = await TeamModel.findWithStats(Number(user.id));
    }

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Error al obtener equipos' },
      { status: 500 }
    );
  }
});

// POST /api/teams - Crear equipo
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {

    const limitCheck = await checkResourceLimit(request, 'teams');
    if (!limitCheck.allowed) {             
      return limitCheck.response ?? NextResponse.json({ error: 'Acceso denegado por límite de recursos' }, { status: 403 });
    }

    const body = await request.json();
    // Validar con Zod
    const validatedData = createTeamSchema.parse(body);

    const team = await TeamModel.create(Number(user.id), {
      ...validatedData,
      description: validatedData.description ?? undefined
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Error al crear equipo' },
      { status: 500 }
    );
  }
});
