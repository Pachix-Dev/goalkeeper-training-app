import { NextRequest, NextResponse } from 'next/server';
import { GoalkeeperAttendanceModel } from '@/lib/db/models/GoalkeeperAttendanceModel';
import { requireAuth, AuthUser } from '@/lib/auth/middleware';
import { updateAttendanceSchema } from '@/lib/validations/attendance';
import { ZodError } from 'zod';

// GET /api/attendance/[id] - Obtener asistencia
export const GET = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const attendanceId = parseInt(id);

    const attendance = await GoalkeeperAttendanceModel.findById(attendanceId);

    return NextResponse.json(attendance);
  } catch (error: any) {
    if (error.message === 'Asistencia no encontrada') {
      return NextResponse.json(
        { error: 'Asistencia no encontrada' },
        { status: 404 }
      );
    }

    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Error al obtener asistencia' },
      { status: 500 }
    );
  }
});

// PUT /api/attendance/[id] - Actualizar asistencia
export const PUT = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const attendanceId = parseInt(id);

    const body = await request.json();
    
    // Validar con Zod
    const validatedData = updateAttendanceSchema.parse(body);

    const updatedAttendance = await GoalkeeperAttendanceModel.update(attendanceId, validatedData);

    return NextResponse.json(updatedAttendance);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    if ((error as any).message === 'Asistencia no encontrada') {
      return NextResponse.json(
        { error: 'Asistencia no encontrada' },
        { status: 404 }
      );
    }

    console.error('Error updating attendance:', error);
    return NextResponse.json(
      { error: 'Error al actualizar asistencia' },
      { status: 500 }
    );
  }
});

// DELETE /api/attendance/[id] - Eliminar asistencia
export const DELETE = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const attendanceId = parseInt(id);

    await GoalkeeperAttendanceModel.delete(attendanceId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Asistencia no encontrada') {
      return NextResponse.json(
        { error: 'Asistencia no encontrada' },
        { status: 404 }
      );
    }

    console.error('Error deleting attendance:', error);
    return NextResponse.json(
      { error: 'Error al eliminar asistencia' },
      { status: 500 }
    );
  }
});
