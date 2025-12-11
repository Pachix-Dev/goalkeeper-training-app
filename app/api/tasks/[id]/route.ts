import { NextRequest, NextResponse } from 'next/server';
import { TaskModel } from '@/lib/db/models/TaskModel';
import { AuthUser, authenticateRequest } from '@/lib/auth/middleware';
import { updateTaskSchema } from '@/lib/validations/task';
import { ZodError } from 'zod';

// GET /api/tasks/[id]
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
    const taskId = parseInt(id);

    const task = await TaskModel.findById(taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la tarea sea pública o pertenezca al usuario
    if (!task.is_public && task.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Error al obtener tarea' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id]
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
    const taskId = parseInt(id);

    const task = await TaskModel.findById(taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    // Solo el creador puede editar
    if (task.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validar con Zod
    const validatedData = updateTaskSchema.parse(body);

    const updatedTask = await TaskModel.update(taskId, validatedData);

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Error al actualizar tarea' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]
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
    const taskId = parseInt(id);

    const task = await TaskModel.findById(taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    // Solo el creador puede eliminar
    if (task.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await TaskModel.delete(taskId);

    return NextResponse.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Error al eliminar tarea' },
      { status: 500 }
    );
  }
}
