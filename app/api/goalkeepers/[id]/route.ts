import { NextRequest, NextResponse } from 'next/server';
import { GoalkeeperModel } from '@/lib/db/models/GoalkeeperModel';
import { TeamModel } from '@/lib/db/models/TeamModel';
import { AuthUser, authenticateRequest } from '@/lib/auth/middleware';
import { updateGoalkeeperSchema } from '@/lib/validations/goalkeeper';
import { ZodError } from 'zod';

// GET /api/goalkeepers/[id]
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
    const goalkeeperId = parseInt(id);

    const goalkeeper = await GoalkeeperModel.findByIdWithTeam(goalkeeperId);
    
    if (!goalkeeper) {
      return NextResponse.json(
        { error: 'Portero no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el portero pertenece a un equipo del usuario
    if (goalkeeper.team_id) {
      const team = await TeamModel.findById(goalkeeper.team_id);
      if (!team || team.user_id !== user.id) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ goalkeeper });
  } catch (error) {
    console.error('Error fetching goalkeeper:', error);
    return NextResponse.json(
      { error: 'Error al obtener portero' },
      { status: 500 }
    );
  }
}

// PUT /api/goalkeepers/[id]
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
    const goalkeeperId = parseInt(id);

    const goalkeeper = await GoalkeeperModel.findById(goalkeeperId);
    
    if (!goalkeeper) {
      return NextResponse.json(
        { error: 'Portero no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el portero pertenece a un equipo del usuario
    if (goalkeeper.team_id) {
      const team = await TeamModel.findById(goalkeeper.team_id);
      if (!team || team.user_id !== user.id) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    
    // Validar con Zod
    const validatedData = updateGoalkeeperSchema.parse(body);

    // Si se cambia el equipo, verificar que pertenece al usuario
    if (validatedData.team_id) {
      const newTeam = await TeamModel.findById(validatedData.team_id);
      if (!newTeam || newTeam.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Equipo no válido' },
          { status: 400 }
        );
      }
    }

    const updatedGoalkeeper = await GoalkeeperModel.update(goalkeeperId, validatedData);

    return NextResponse.json({ goalkeeper: updatedGoalkeeper });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating goalkeeper:', error);
    return NextResponse.json(
      { error: 'Error al actualizar portero' },
      { status: 500 }
    );
  }
}

// DELETE /api/goalkeepers/[id]
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
    const goalkeeperId = parseInt(id);

    const goalkeeper = await GoalkeeperModel.findById(goalkeeperId);
    
    if (!goalkeeper) {
      return NextResponse.json(
        { error: 'Portero no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el portero pertenece a un equipo del usuario
    if (goalkeeper.team_id) {
      const team = await TeamModel.findById(goalkeeper.team_id);
      if (!team || team.user_id !== user.id) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }
    }

    await GoalkeeperModel.delete(goalkeeperId);

    return NextResponse.json({ message: 'Portero eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting goalkeeper:', error);
    return NextResponse.json(
      { error: 'Error al eliminar portero' },
      { status: 500 }
    );
  }
}
