import { z } from 'zod';

// Schema para crear un diseño de entrenamiento
export const createDesignSchema = z.object({
  title: z.string().min(1).max(200),
  data: z.record(z.any()), // tldraw store serializado
  locale: z.string().optional(),
  training_session_id: z.number().int().positive().optional()
});

// Schema para actualizar un diseño
export const updateDesignSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  data: z.record(z.any()).optional(),
  training_session_id: z.number().int().positive().nullable().optional()
});

export type CreateDesignInput = z.infer<typeof createDesignSchema>;
export type UpdateDesignInput = z.infer<typeof updateDesignSchema>;
