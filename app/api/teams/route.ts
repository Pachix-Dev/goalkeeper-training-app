import { NextRequest, NextResponse } from 'next/server';
import { TeamModel } from '@/lib/db/models/TeamModel';
import { requireAuth } from '@/lib/auth/middleware';

// GET /api/teams - Obtener equipos del usuario
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const teams = await TeamModel.findWithStats(user.id);
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
    const body = await request.json();
    const { name, category, season, description, color } = body;

    // Validar campos requeridos
    if (!name || !category || !season) {
      return NextResponse.json(
        { error: 'Nombre, categoría y temporada son requeridos' },
        { status: 400 }
      );
    }

    const team = await TeamModel.create(user.id, {
      name,
      category,
      season,
      description,
      color
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Error al crear equipo' },
      { status: 500 }
    );
  }
});
