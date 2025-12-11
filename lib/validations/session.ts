import { z } from 'zod';

// Schema para crear sesión
export const createSessionSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(255),
  description: z.string().max(5000).optional(),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora inválido (HH:MM o HH:MM:SS)').optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora inválido (HH:MM o HH:MM:SS)').optional(),
  location: z.string().max(255).optional(),
  team_id: z.number().int().positive('Equipo requerido'),
  session_type: z.enum(['training', 'match', 'recovery', 'tactical', 'physical']).default('training'),
  status: z.enum(['planned', 'completed', 'cancelled']).default('planned'),
  notes: z.string().max(5000).optional(),
  weather: z.string().max(100).optional()
});

// Schema para actualizar sesión
export const updateSessionSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(5000).optional(),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  location: z.string().max(255).optional(),
  session_type: z.enum(['training', 'match', 'recovery', 'tactical', 'physical']).optional(),
  status: z.enum(['planned', 'completed', 'cancelled']).optional(),
  notes: z.string().max(5000).optional(),
  weather: z.string().max(100).optional()
});

// Schema para agregar tarea a sesión
export const addSessionTaskSchema = z.object({
  task_id: z.number().int().positive('Tarea requerida'),
  order_number: z.number().int().min(1, 'El orden debe ser al menos 1'),
  duration: z.number().int().min(1).max(300).optional(),
  intensity: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
  notes: z.string().max(1000).optional()
});

// Schema para actualizar tarea de sesión
export const updateSessionTaskSchema = z.object({
  order_number: z.number().int().min(1).optional(),
  duration: z.number().int().min(1).max(300).optional(),
  intensity: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
  notes: z.string().max(1000).optional()
});

// Schema para reordenar tareas
export const reorderTasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.number().int().positive(),
      order_number: z.number().int().min(1)
    })
  ).min(1, 'Debe proporcionar al menos una tarea para reordenar')
});

// Types
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type AddSessionTaskInput = z.infer<typeof addSessionTaskSchema>;
export type UpdateSessionTaskInput = z.infer<typeof updateSessionTaskSchema>;
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>;
