import { NextRequest, NextResponse } from 'next/server';
import { SessionTaskModel } from '@/lib/db/models/SessionTaskModel';
import { TrainingSessionModel } from '@/lib/db/models/TrainingSessionModel';
import { requireAuth, AuthUser } from '@/lib/auth/middleware';
import { addSessionTaskSchema, reorderTasksSchema } from '@/lib/validations/session';
import { ZodError } from 'zod';

// GET /api/sessions/[id]/tasks - Obtener tareas de una sesión
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

    const tasks = await SessionTaskModel.findBySession(sessionId);

    return NextResponse.json(tasks);
  } catch (error: any) {
    if (error.message === 'Sesión no encontrada') {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    console.error('Error fetching session tasks:', error);
    return NextResponse.json(
      { error: 'Error al obtener tareas' },
      { status: 500 }
    );
  }
});

// POST /api/sessions/[id]/tasks - Agregar tarea a sesión
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
    const validatedData = addSessionTaskSchema.parse(body);

    const sessionTask = await SessionTaskModel.addTask({
      session_id: sessionId,
      ...validatedData,
    });

    return NextResponse.json(sessionTask, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error adding session task:', error);
    return NextResponse.json(
      { error: 'Error al agregar tarea' },
      { status: 500 }
    );
  }
});

// PATCH /api/sessions/[id]/tasks - Reordenar tareas
export const PATCH = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
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
    const validatedData = reorderTasksSchema.parse(body);

    await SessionTaskModel.reorder(sessionId, validatedData.tasks);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error reordering tasks:', error);
    return NextResponse.json(
      { error: 'Error al reordenar tareas' },
      { status: 500 }
    );
  }
});
