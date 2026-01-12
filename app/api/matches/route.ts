import { NextRequest, NextResponse } from 'next/server';
import { MatchAnalysisModel } from '@/lib/db/models/MatchAnalysisModel';
import { requireAuth } from '@/lib/auth/middleware';
import { createMatchAnalysisSchema } from '@/lib/validations/matchAnalysis';
import { ZodError } from 'zod';

// GET /api/matches - Obtener análisis de partidos
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const userId = Number(user.id);
    const { searchParams } = new URL(request.url);
    const goalkeeperId = searchParams.get('goalkeeper_id');
    const opponent = searchParams.get('opponent');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (goalkeeperId) {
      const limit = searchParams.get('limit');
      const matches = await MatchAnalysisModel.findByGoalkeeper(
        parseInt(goalkeeperId),
        limit ? parseInt(limit) : undefined
      );
      return NextResponse.json(matches);
    }

    if (opponent) {
      const matches = await MatchAnalysisModel.searchByOpponent(userId, opponent);
      return NextResponse.json(matches);
    }

    if (startDate && endDate) {
      const matches = await MatchAnalysisModel.findByDateRange(userId, startDate, endDate);
      return NextResponse.json(matches);
    }

    const matches = await MatchAnalysisModel.findByUser(userId);
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Error al obtener análisis de partidos' },
      { status: 500 }
    );
  }
});

// POST /api/matches - Crear análisis de partido
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const userId = Number(user.id);
    const body = await request.json();
    
    // Validar con Zod
    const validatedData = createMatchAnalysisSchema.parse(body);

    const match = await MatchAnalysisModel.create({
      ...validatedData,
      created_by: userId,
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating match analysis:', error);
    return NextResponse.json(
      { error: 'Error al crear análisis de partido' },
      { status: 500 }
    );
  }
});
