import { NextRequest, NextResponse } from 'next/server';
import { PenaltyModel } from '@/lib/db/models/PenaltyModel';
import { requireAuth, AuthUser } from '@/lib/auth/middleware';
import { updatePenaltySchema } from '@/lib/validations/penalty';
import { ZodError } from 'zod';

// GET /api/penalties/[id] - Obtener penalti
export const GET = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const penaltyId = parseInt(id);

    const penalty = await PenaltyModel.findById(penaltyId);

    // Verificar que el penalti pertenece al usuario
    if (penalty.created_by !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.json(penalty);
  } catch (error: unknown) {
    if ((error as Error).message === 'Penalti no encontrado') {
      return NextResponse.json(
        { error: 'Penalti no encontrado' },
        { status: 404 }
      );
    }

    console.error('Error fetching penalty:', error);
    return NextResponse.json(
      { error: 'Error al obtener penalti' },
      { status: 500 }
    );
  }
});

// PUT /api/penalties/[id] - Actualizar penalti
export const PUT = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const penaltyId = parseInt(id);

    // Verificar que el penalti pertenece al usuario
    const penalty = await PenaltyModel.findById(penaltyId);
    if (penalty.created_by !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validar con Zod
    const validatedData = updatePenaltySchema.parse(body);

    const updatedPenalty = await PenaltyModel.update(penaltyId, validatedData);

    return NextResponse.json(updatedPenalty);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }

    if ((error as Error).message === 'Penalti no encontrado') {
      return NextResponse.json(
        { error: 'Penalti no encontrado' },
        { status: 404 }
      );
    }

    console.error('Error updating penalty:', error);
    return NextResponse.json(
      { error: 'Error al actualizar penalti' },
      { status: 500 }
    );
  }
});

// DELETE /api/penalties/[id] - Eliminar penalti
export const DELETE = requireAuth(async (request: NextRequest, user: AuthUser, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { params } = context!;
    const { id } = await params;
    const penaltyId = parseInt(id);

    // Verificar que el penalti pertenece al usuario
    const penalty = await PenaltyModel.findById(penaltyId);
    if (penalty.created_by !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await PenaltyModel.delete(penaltyId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as Error).message === 'Penalti no encontrado') {
      return NextResponse.json(
        { error: 'Penalti no encontrado' },
        { status: 404 }
      );
    }

    console.error('Error deleting penalty:', error);
    return NextResponse.json(
      { error: 'Error al eliminar penalti' },
      { status: 500 }
    );
  }
});
