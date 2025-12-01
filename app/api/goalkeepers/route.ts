import { NextRequest, NextResponse } from 'next/server';
import { GoalkeeperModel } from '@/lib/db/models/GoalkeeperModel';
import { TeamModel } from '@/lib/db/models/TeamModel';
import { requireAuth } from '@/lib/auth/middleware';

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

    return NextResponse.json({ goalkeepers });
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
    const { first_name, last_name, team_id, ...rest } = body;

    // Validar campos requeridos
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'Nombre y apellido son requeridos' },
        { status: 400 }
      );
    }

    // Si se especifica un equipo, verificar que pertenece al usuario
    if (team_id) {
      const team = await TeamModel.findById(team_id);
      if (!team || team.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Equipo no válido' },
          { status: 400 }
        );
      }
    }

    const goalkeeper = await GoalkeeperModel.create({
      first_name,
      last_name,
      team_id,
      ...rest
    });

    return NextResponse.json({ goalkeeper }, { status: 201 });
  } catch (error) {
    console.error('Error creating goalkeeper:', error);
    return NextResponse.json(
      { error: 'Error al crear portero' },
      { status: 500 }
    );
  }
});
