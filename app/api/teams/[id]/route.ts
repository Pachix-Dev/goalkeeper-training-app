import { NextRequest, NextResponse } from 'next/server';
import { TeamModel } from '@/lib/db/models/TeamModel';
import { AuthUser, authenticateRequest } from '@/lib/auth/middleware';
import { updateTeamSchema } from '@/lib/validations/team';
import { ZodError } from 'zod';

// GET /api/teams/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user: AuthUser | null = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const teamId = parseInt(id);

    const team = await TeamModel.findById(teamId);
    
    if (!team) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el equipo pertenece al usuario
    if (team.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Error al obtener equipo' },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user: AuthUser | null = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const teamId = parseInt(id);
    const body = await request.json();

    const team = await TeamModel.findById(teamId);
    
    if (!team) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el equipo pertenece al usuario
    if (team.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Validar con Zod
    const validatedData = updateTeamSchema.parse(body);

    // Transform null to undefined for description field
    const updateData = {
      ...validatedData,
      description: validatedData.description ?? undefined
    };

    const updatedTeam = await TeamModel.update(teamId, updateData);
    return NextResponse.json({ team: updatedTeam });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Error al actualizar equipo' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user: AuthUser | null = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const teamId = parseInt(id);

    const team = await TeamModel.findById(teamId);
    
    if (!team) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el equipo pertenece al usuario
    if (team.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await TeamModel.delete(teamId);
    return NextResponse.json({ message: 'Equipo eliminado' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Error al eliminar equipo' },
      { status: 500 }
    );
  }
}
