import { NextRequest, NextResponse } from 'next/server';
import { PenaltyModel } from '@/lib/db/models/PenaltyModel';
import { requireAuth } from '@/lib/auth/middleware';

// GET /api/penalties/analysis - Análisis de tendencias
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const kicker = searchParams.get('kicker');

    if (!kicker) {
      return NextResponse.json(
        { error: 'Parámetro kicker requerido' },
        { status: 400 }
      );
    }

    const tendencies = await PenaltyModel.getKickerTendencies(user.id, kicker);

    return NextResponse.json(tendencies);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Error al obtener análisis' },
      { status: 500 }
    );
  }
});
