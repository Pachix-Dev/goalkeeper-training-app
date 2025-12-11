import { z } from 'zod';

// Schema para registrar asistencia
export const createAttendanceSchema = z.object({
  session_id: z.number().int().positive('Sesión requerida'),
  goalkeeper_id: z.number().int().positive('Portero requerido'),
  status: z.enum(['present', 'absent', 'late', 'injured', 'excused']).default('present'),
  notes: z.string().max(1000).optional()
});

// Schema para actualizar asistencia
export const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'late', 'injured', 'excused']).optional(),
  notes: z.string().max(1000).optional()
});

// Schema para asistencia masiva
export const bulkAttendanceSchema = z.object({
  attendances: z.array(
    z.object({
      goalkeeper_id: z.number().int().positive(),
      status: z.enum(['present', 'absent', 'late', 'injured', 'excused']),
      notes: z.string().max(1000).optional()
    })
  ).min(1, 'Debe proporcionar al menos un portero')
});

// Types
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
