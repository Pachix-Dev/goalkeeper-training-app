import { NextRequest, NextResponse } from 'next/server';
import { TeamModel } from '@/lib/db/models/TeamModel';
import { AuthUser, authenticateRequest } from '@/lib/auth/middleware';

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

    const updatedTeam = await TeamModel.update(teamId, body);
    return NextResponse.json({ team: updatedTeam });
  } catch (error) {
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
