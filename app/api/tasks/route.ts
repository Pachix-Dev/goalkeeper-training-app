import { NextRequest, NextResponse } from 'next/server';
import { TaskModel } from '@/lib/db/models/TaskModel';
import { requireAuth } from '@/lib/auth/middleware';
import { createTaskSchema } from '@/lib/validations/task';
import { ZodError } from 'zod';

// GET /api/tasks - Obtener tareas disponibles
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const myTasks = searchParams.get('my_tasks') === 'true';

    let tasks;

    if (search) {
      // Intentar búsqueda FULLTEXT primero, si falla usar búsqueda simple
      try {
        tasks = await TaskModel.search(user.id, search);
      } catch {
        tasks = await TaskModel.searchSimple(user.id, search);
      }
    } else if (category) {
      tasks = await TaskModel.findByCategory(user.id, category);
    } else if (myTasks) {
      tasks = await TaskModel.findByUser(user.id);
    } else {
      tasks = await TaskModel.findAvailable(user.id);
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Error al obtener tareas' },
      { status: 500 }
    );
  }
});

// POST /api/tasks - Crear tarea
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    
    // Validar con Zod
    const validatedData = createTaskSchema.parse(body);

    const task = await TaskModel.create({
      ...validatedData,
      user_id: user.id,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Error al crear tarea' },
      { status: 500 }
    );
  }
});
