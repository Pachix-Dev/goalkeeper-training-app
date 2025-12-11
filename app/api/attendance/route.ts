import { NextRequest, NextResponse } from 'next/server';
import { GoalkeeperAttendanceModel } from '@/lib/db/models/GoalkeeperAttendanceModel';
import { requireAuth } from '@/lib/auth/middleware';
import { createAttendanceSchema } from '@/lib/validations/attendance';
import { ZodError } from 'zod';

// GET /api/attendance - Obtener asistencias
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const goalkeeperId = searchParams.get('goalkeeper_id');

    if (sessionId) {
      const attendances = await GoalkeeperAttendanceModel.findBySession(parseInt(sessionId));
      return NextResponse.json(attendances);
    }

    if (goalkeeperId) {
      const limit = searchParams.get('limit');
      const attendances = await GoalkeeperAttendanceModel.findByGoalkeeper(
        parseInt(goalkeeperId),
        limit ? parseInt(limit) : undefined
      );
      return NextResponse.json(attendances);
    }

    return NextResponse.json(
      { error: 'Se requiere session_id o goalkeeper_id' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Error al obtener asistencias' },
      { status: 500 }
    );
  }
});

// POST /api/attendance - Registrar asistencia
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    
    // Validar con Zod
    const validatedData = createAttendanceSchema.parse(body);

    const attendance = await GoalkeeperAttendanceModel.create(validatedData);

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating attendance:', error);
    return NextResponse.json(
      { error: 'Error al registrar asistencia' },
      { status: 500 }
    );
  }
});
