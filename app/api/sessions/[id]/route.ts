import { NextRequest, NextResponse } from 'next/server';
import { TrainingSessionModel } from '@/lib/db/models/TrainingSessionModel';
import { requireAuth, AuthUser } from '@/lib/auth/middleware';
import { updateSessionSchema } from '@/lib/validations/session';
import { ZodError } from 'zod';

// GET /api/sessions/[id] - Obtener sesión
export const GET = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const sessionId = parseInt(id);

    const session = await TrainingSessionModel.findById(sessionId);

    // Verificar que la sesión pertenece al usuario
    if (session.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.json(session);
  } catch (error: any) {
    if (error.message === 'Sesión no encontrada') {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Error al obtener sesión' },
      { status: 500 }
    );
  }
});

// PUT /api/sessions/[id] - Actualizar sesión
export const PUT = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
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
    const validatedData = updateSessionSchema.parse(body);

    const updatedSession = await TrainingSessionModel.update(sessionId, validatedData);

    return NextResponse.json(updatedSession);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    if ((error as any).message === 'Sesión no encontrada') {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Error al actualizar sesión' },
      { status: 500 }
    );
  }
});

// DELETE /api/sessions/[id] - Eliminar sesión
export const DELETE = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
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

    await TrainingSessionModel.delete(sessionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Sesión no encontrada') {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Error al eliminar sesión' },
      { status: 500 }
    );
  }
});
