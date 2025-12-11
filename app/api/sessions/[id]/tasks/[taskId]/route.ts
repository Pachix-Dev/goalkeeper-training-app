import { NextRequest, NextResponse } from 'next/server';
import { SessionTaskModel } from '@/lib/db/models/SessionTaskModel';
import { TrainingSessionModel } from '@/lib/db/models/TrainingSessionModel';
import { requireAuth, AuthUser } from '@/lib/auth/middleware';
import { updateSessionTaskSchema } from '@/lib/validations/session';
import { ZodError } from 'zod';

// PUT /api/sessions/[id]/tasks/[taskId] - Actualizar tarea de sesión
export const PUT = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string; taskId: string }> }) => {
  try {
    const { params } = context!;
    const { id, taskId } = await params;
    const sessionId = parseInt(id);
    const sessionTaskId = parseInt(taskId);

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
    const validatedData = updateSessionTaskSchema.parse(body);

    const updatedTask = await SessionTaskModel.update(sessionTaskId, validatedData);

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    if ((error as any).message === 'Tarea de sesión no encontrada') {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    console.error('Error updating session task:', error);
    return NextResponse.json(
      { error: 'Error al actualizar tarea' },
      { status: 500 }
    );
  }
});

// DELETE /api/sessions/[id]/tasks/[taskId] - Eliminar tarea de sesión
export const DELETE = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string; taskId: string }> }) => {
  try {
    const { params } = context!;
    const { id, taskId } = await params;
    const sessionId = parseInt(id);
    const sessionTaskId = parseInt(taskId);

    // Verificar que la sesión pertenece al usuario
    const session = await TrainingSessionModel.findById(sessionId);
    if (session.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await SessionTaskModel.delete(sessionTaskId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Tarea de sesión no encontrada') {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    console.error('Error deleting session task:', error);
    return NextResponse.json(
      { error: 'Error al eliminar tarea' },
      { status: 500 }
    );
  }
});
