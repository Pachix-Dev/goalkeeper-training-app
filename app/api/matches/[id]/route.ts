import { NextRequest, NextResponse } from 'next/server';
import { MatchAnalysisModel } from '@/lib/db/models/MatchAnalysisModel';
import { requireAuth, AuthUser } from '@/lib/auth/middleware';
import { updateMatchAnalysisSchema } from '@/lib/validations/matchAnalysis';
import { ZodError } from 'zod';

// GET /api/matches/[id] - Obtener análisis de partido
export const GET = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const matchId = parseInt(id);

    const match = await MatchAnalysisModel.findById(matchId);

    // Verificar que el análisis pertenece al usuario
    if (match.created_by !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.json(match);
  } catch (error: unknown) {
    if ((error as Error).message === 'Análisis no encontrado') {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    console.error('Error fetching match analysis:', error);
    return NextResponse.json(
      { error: 'Error al obtener análisis' },
      { status: 500 }
    );
  }
});

// PUT /api/matches/[id] - Actualizar análisis de partido
export const PUT = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const matchId = parseInt(id);

    // Verificar que el análisis pertenece al usuario
    const match = await MatchAnalysisModel.findById(matchId);
    if (match.created_by !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validar con Zod
    const validatedData = updateMatchAnalysisSchema.parse(body);

    const updatedMatch = await MatchAnalysisModel.update(matchId, validatedData);

    return NextResponse.json(updatedMatch);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    if ((error as Error).message === 'Análisis no encontrado') {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    console.error('Error updating match analysis:', error);
    return NextResponse.json(
      { error: 'Error al actualizar análisis' },
      { status: 500 }
    );
  }
});

// DELETE /api/matches/[id] - Eliminar análisis de partido
export const DELETE = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const matchId = parseInt(id);

    // Verificar que el análisis pertenece al usuario
    const match = await MatchAnalysisModel.findById(matchId);
    if (match.created_by !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await MatchAnalysisModel.delete(matchId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as Error).message === 'Análisis no encontrado') {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    console.error('Error deleting match analysis:', error);
    return NextResponse.json(
      { error: 'Error al eliminar análisis' },
      { status: 500 }
    );
  }
});
