import { z } from 'zod';

// Schema para crear equipo
export const createTeamSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(255),
  category: z.string().min(1, 'La categoría es requerida').max(100),
  season: z.string().min(4, 'La temporada es requerida').max(50),
  description: z.string().max(1000).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (debe ser formato HEX)').optional().default('#2563eb'),
});

// Schema para actualizar equipo
export const updateTeamSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  category: z.string().min(1).max(100).optional(),
  season: z.string().min(4).max(50).optional(),
  description: z.string().max(1000).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  is_active: z.boolean().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
