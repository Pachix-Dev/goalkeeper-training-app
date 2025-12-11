import { NextRequest, NextResponse } from 'next/server';
import { GoalkeeperModel } from '@/lib/db/models/GoalkeeperModel';
import { TeamModel } from '@/lib/db/models/TeamModel';
import { requireAuth } from '@/lib/auth/middleware';
import { createGoalkeeperSchema } from '@/lib/validations/goalkeeper';
import { ZodError } from 'zod';

// GET /api/goalkeepers - Obtener porteros del usuario
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');
    const search = searchParams.get('search');

    let goalkeepers;

    if (search) {
      goalkeepers = await GoalkeeperModel.search(user.id, search);
    } else if (teamId) {
      // Verificar que el equipo pertenece al usuario
      const team = await TeamModel.findById(parseInt(teamId));
      if (!team || team.user_id !== user.id) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }
      goalkeepers = await GoalkeeperModel.findByTeam(parseInt(teamId));
    } else {
      goalkeepers = await GoalkeeperModel.findByCoach(user.id);
    }

    return NextResponse.json(goalkeepers);
  } catch (error) {
    console.error('Error fetching goalkeepers:', error);
    return NextResponse.json(
      { error: 'Error al obtener porteros' },
      { status: 500 }
    );
  }
});

// POST /api/goalkeepers - Crear portero
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    
    // Validar con Zod
    const validatedData = createGoalkeeperSchema.parse(body);

    // Si se especifica un equipo, verificar que pertenece al usuario
    if (validatedData.team_id) {
      const team = await TeamModel.findById(validatedData.team_id);
      if (!team || team.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Equipo no válido' },
          { status: 400 }
        );
      }
    }

    const goalkeeper = await GoalkeeperModel.create(validatedData);

    return NextResponse.json({ goalkeeper }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating goalkeeper:', error);
    return NextResponse.json(
      { error: 'Error al crear portero' },
      { status: 500 }
    );
  }
});
