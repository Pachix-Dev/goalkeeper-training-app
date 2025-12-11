import { NextRequest, NextResponse } from 'next/server';
import { GoalkeeperStatisticsModel } from '@/lib/db/models/GoalkeeperStatisticsModel';
import { requireAuth, AuthUser } from '@/lib/auth/middleware';
import { updateStatisticsSchema } from '@/lib/validations/statistics';
import { ZodError } from 'zod';

// GET /api/statistics/[id] - Obtener estadísticas por ID
export const GET = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const statisticsId = parseInt(id);

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
