import { NextRequest, NextResponse } from 'next/server';
import { GoalkeeperAttendanceModel } from '@/lib/db/models/GoalkeeperAttendanceModel';
import { TrainingSessionModel } from '@/lib/db/models/TrainingSessionModel';
import { requireAuth, AuthUser } from '@/lib/auth/middleware';
import { bulkAttendanceSchema } from '@/lib/validations/attendance';
import { ZodError } from 'zod';

// POST /api/sessions/[id]/attendance - Registrar asistencia masiva
export const POST = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const sessionId = parseInt(id);

    // Verificar que la sesión pertenece al usuario
    const session = await TrainingSessionModel.findById(sessionId);
    if (session.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validar con Zod
    const validatedData = bulkAttendanceSchema.parse(body);

    // Agregar session_id a cada asistencia
    const attendances = validatedData.attendances.map(att => ({
      session_id: sessionId,
      ...att
    }));

    await GoalkeeperAttendanceModel.bulkCreate(attendances);

    // Obtener asistencias actualizadas
    const updatedAttendances = await GoalkeeperAttendanceModel.findBySession(sessionId);

    return NextResponse.json(updatedAttendances, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating bulk attendance:', error);
    return NextResponse.json(
      { error: 'Error al registrar asistencias' },
      { status: 500 }
    );
  }
});

// GET /api/sessions/[id]/attendance - Obtener asistencias de una sesión
export const GET = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const sessionId = parseInt(id);

    // Verificar que la sesión pertenece al usuario
    const session = await TrainingSessionModel.findById(sessionId);
    if (session.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const attendances = await GoalkeeperAttendanceModel.findBySession(sessionId);

    return NextResponse.json(attendances);
  } catch (error: any) {
    if (error.message === 'Sesión no encontrada') {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    console.error('Error fetching session attendance:', error);
    return NextResponse.json(
      { error: 'Error al obtener asistencias' },
      { status: 500 }
    );
  }
});
