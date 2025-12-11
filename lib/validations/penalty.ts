import { z } from 'zod';

// Schema para crear penalti
export const createPenaltySchema = z.object({
  goalkeeper_id: z.number().int().positive('Portero requerido'),
  opponent_name: z.string().min(2, 'Nombre del oponente requerido').max(255),
  match_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido').optional(),
  competition: z.string().max(255).optional(),
  penalty_taker: z.string().min(2, 'Nombre del lanzador requerido').max(255),
  taker_foot: z.enum(['left', 'right']).optional(),
  shot_direction: z.enum(['left', 'center', 'right']),
  shot_height: z.enum(['low', 'mid', 'high']),
  result: z.enum(['saved', 'goal', 'missed', 'post']),
  goalkeeper_direction: z.enum(['left', 'center', 'right', 'stayed']).optional(),
  notes: z.string().max(2000).optional(),
  video_url: z.string().url('URL inválida').max(500).optional()
});

// Schema para actualizar penalti
export const updatePenaltySchema = z.object({
  opponent_name: z.string().min(2).max(255).optional(),
  match_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  competition: z.string().max(255).optional(),
  penalty_taker: z.string().min(2).max(255).optional(),
  taker_foot: z.enum(['left', 'right']).optional(),
  shot_direction: z.enum(['left', 'center', 'right']).optional(),
  shot_height: z.enum(['low', 'mid', 'high']).optional(),
  result: z.enum(['saved', 'goal', 'missed', 'post']).optional(),
  goalkeeper_direction: z.enum(['left', 'center', 'right', 'stayed']).optional(),
  notes: z.string().max(2000).optional(),
  video_url: z.string().url().max(500).optional()
});

// Types
export type CreatePenaltyInput = z.infer<typeof createPenaltySchema>;
export type UpdatePenaltyInput = z.infer<typeof updatePenaltySchema>;
