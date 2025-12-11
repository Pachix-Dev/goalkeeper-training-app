import { NextRequest, NextResponse } from 'next/server';
import { GoalkeeperStatisticsModel } from '@/lib/db/models/GoalkeeperStatisticsModel';
import { requireAuth, AuthUser } from '@/lib/auth/middleware';
import { createStatisticsSchema, compareGoalkeepersSchema } from '@/lib/validations/statistics';
import { ZodError } from 'zod';

// GET /api/statistics - Obtener estadísticas con filtros
export const GET = requireAuth(async (request: NextRequest, _user: AuthUser) => {
  try {
    const { searchParams } = new URL(request.url);
    const goalkeeper_id = searchParams.get('goalkeeper_id');
    const team_id = searchParams.get('team_id');
    const season = searchParams.get('season');
    const action = searchParams.get('action');

    // Acción: comparar porteros
    if (action === 'compare') {
      const goalkeeper_ids = searchParams.get('goalkeeper_ids')?.split(',').map(Number);
      if (!goalkeeper_ids || !season) {
        return NextResponse.json(
          { error: 'Se requieren goalkeeper_ids y season para comparar' },
          { status: 400 }
        );
      }

      const validatedData = compareGoalkeepersSchema.parse({ goalkeeper_ids, season });
      const comparison = await GoalkeeperStatisticsModel.compareGoalkeepers(
        validatedData.goalkeeper_ids,
        validatedData.season
      );

      return NextResponse.json(comparison);
    }

    // Acción: mejores porteros de la temporada
    if (action === 'top-performers' && season) {
      const limit = parseInt(searchParams.get('limit') || '10');
      const topPerformers = await GoalkeeperStatisticsModel.getTopPerformers(season, limit);
      return NextResponse.json(topPerformers);
    }

    // Acción: estadísticas agregadas de temporada
    if (action === 'season-stats' && season) {
      const stats = await GoalkeeperStatisticsModel.getSeasonStats(season);
      return NextResponse.json(stats);
    }

    // Acción: obtener temporadas disponibles
    if (action === 'seasons') {
      const seasons = await GoalkeeperStatisticsModel.getAvailableSeasons();
      return NextResponse.json(seasons);
    }

    // Filtrar por portero
    if (goalkeeper_id) {
      const statistics = await GoalkeeperStatisticsModel.findByGoalkeeper(parseInt(goalkeeper_id));
      return NextResponse.json(statistics);
    }

    // Filtrar por equipo
    if (team_id) {
      const statistics = await GoalkeeperStatisticsModel.findByTeam(
        parseInt(team_id),
        season || undefined
      );
      return NextResponse.json(statistics);
    }

    // Filtrar por temporada
    if (season) {
      const statistics = await GoalkeeperStatisticsModel.findBySeason(season);
      return NextResponse.json(statistics);
    }

    // Sin filtros, devolver error
    return NextResponse.json(
      { error: 'Se requiere al menos un filtro: goalkeeper_id, team_id o season' },
      { status: 400 }
    );

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
});

// POST /api/statistics - Crear estadísticas
export const POST = requireAuth(async (request: NextRequest, _user: AuthUser) => {
  try {
    const body = await request.json();
    
    // Validar con Zod
    const validatedData = createStatisticsSchema.parse(body);

    // Verificar si ya existen estadísticas para este portero en esta temporada
    const exists = await GoalkeeperStatisticsModel.exists(
      validatedData.goalkeeper_id,
      validatedData.season
    );

    if (exists) {
      return NextResponse.json(
        { error: 'Ya existen estadísticas para este portero en esta temporada' },
        { status: 409 }
      );
    }

    const statistics = await GoalkeeperStatisticsModel.create(validatedData);

    return NextResponse.json(statistics, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating statistics:', error);
    return NextResponse.json(
      { error: 'Error al crear estadísticas' },
      { status: 500 }
    );
  }
});
