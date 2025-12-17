import { NextRequest, NextResponse } from 'next/server';
import { GoalkeeperStatisticsModel } from '@/lib/db/models/GoalkeeperStatisticsModel';
import { requireAuth, AuthUser } from '@/lib/auth/middleware';
import { updateStatisticsSchema } from '@/lib/validations/statistics';
import { ZodError } from 'zod';
import pool from '@/lib/db/connection';
import { RowDataPacket } from 'mysql2';

// GET /api/statistics/[id] - Obtener estadísticas por ID
export const GET = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const statisticsId = parseInt(id);

    // Verificar primero que el portero pertenece a un equipo del usuario
    const [teamCheck] = await pool.query<RowDataPacket[]>(
      `SELECT t.id FROM teams t
       INNER JOIN goalkeepers g ON g.team_id = t.id
       INNER JOIN goalkeeper_statistics gs ON gs.goalkeeper_id = g.id
       WHERE gs.id = ? AND t.user_id = ?`,
      [statisticsId, user.id]
    );

    console.log('Authorization check:', { statisticsId, userId: user.id, found: teamCheck.length });

    if (teamCheck.length === 0) {
      // Verificar si las estadísticas existen y a qué usuario pertenecen
      const [statsInfo] = await pool.query<RowDataPacket[]>(
        `SELECT 
          gs.id, 
          gs.goalkeeper_id,
          g.first_name,
          g.last_name,
          g.team_id,
          t.name as team_name,
          t.user_id as team_owner_id
         FROM goalkeeper_statistics gs
         LEFT JOIN goalkeepers g ON gs.goalkeeper_id = g.id
         LEFT JOIN teams t ON g.team_id = t.id
         WHERE gs.id = ?`,
        [statisticsId]
      );
      console.log('Statistics info:', statsInfo);
      
      if (statsInfo.length === 0) {
        return NextResponse.json(
          { error: 'Estadísticas no encontradas' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'No autorizado para ver estas estadísticas' },
        { status: 403 }
      );
    }

    // Si pasa la verificación, obtener las estadísticas
    const statistics = await GoalkeeperStatisticsModel.findById(statisticsId);

    return NextResponse.json(statistics);
  } catch (error: unknown) {
    if ((error as Error).message === 'Estadísticas no encontradas') {
      return NextResponse.json(
        { error: 'Estadísticas no encontradas' },
        { status: 404 }
      );
    }

    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
});

// PUT /api/statistics/[id] - Actualizar estadísticas
export const PUT = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const statisticsId = parseInt(id);

    // Verificar que la estadística pertenece a un portero del equipo del usuario
    const [teamCheck] = await pool.query<RowDataPacket[]>(
      `SELECT t.id FROM teams t
       INNER JOIN goalkeepers g ON g.team_id = t.id
       INNER JOIN goalkeeper_statistics gs ON gs.goalkeeper_id = g.id
       WHERE gs.id = ? AND t.user_id = ?`,
      [statisticsId, user.id]
    );

    if (teamCheck.length === 0) {
      return NextResponse.json(
        { error: 'No autorizado para actualizar estas estadísticas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validar con Zod
    const validatedData = updateStatisticsSchema.parse(body);

    const updatedStatistics = await GoalkeeperStatisticsModel.update(statisticsId, validatedData);

    return NextResponse.json(updatedStatistics);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    if ((error as Error).message === 'Estadísticas no encontradas') {
      return NextResponse.json(
        { error: 'Estadísticas no encontradas' },
        { status: 404 }
      );
    }

    console.error('Error updating statistics:', error);
    return NextResponse.json(
      { error: 'Error al actualizar estadísticas' },
      { status: 500 }
    );
  }
});

// DELETE /api/statistics/[id] - Eliminar estadísticas
export const DELETE = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const statisticsId = parseInt(id);

    // Verificar que la estadística pertenece a un portero del equipo del usuario
    const [teamCheck] = await pool.query<RowDataPacket[]>(
      `SELECT t.id FROM teams t
       INNER JOIN goalkeepers g ON g.team_id = t.id
       INNER JOIN goalkeeper_statistics gs ON gs.goalkeeper_id = g.id
       WHERE gs.id = ? AND t.user_id = ?`,
      [statisticsId, user.id]
    );

    if (teamCheck.length === 0) {
      return NextResponse.json(
        { error: 'No autorizado para eliminar estas estadísticas' },
        { status: 403 }
      );
    }

    await GoalkeeperStatisticsModel.delete(statisticsId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as Error).message === 'Estadísticas no encontradas') {
      return NextResponse.json(
        { error: 'Estadísticas no encontradas' },
        { status: 404 }
      );
    }

    console.error('Error deleting statistics:', error);
    return NextResponse.json(
      { error: 'Error al eliminar estadísticas' },
      { status: 500 }
    );
  }
});
