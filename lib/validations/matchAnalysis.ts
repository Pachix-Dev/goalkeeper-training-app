import { z } from 'zod';

// Schema para crear análisis de partido
export const createMatchAnalysisSchema = z.object({
  goalkeeper_id: z.number().int().positive('Portero requerido'),
  match_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  opponent: z.string().min(2, 'Nombre del oponente requerido').max(255),
  competition: z.string().max(255).optional(),
  result: z.string().max(50).optional(),
  minutes_played: z.number().int().min(0).max(120).optional(),
  goals_conceded: z.number().int().min(0).optional(),
  saves: z.number().int().min(0).optional(),
  high_balls: z.number().int().min(0).optional(),
  crosses_caught: z.number().int().min(0).optional(),
  distribution_success_rate: z.number().min(0).max(100).optional(),
  rating: z.number().min(0).max(10).optional(),
  strengths: z.string().max(2000).optional(),
  areas_for_improvement: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  video_url: z.string().url('URL inválida').max(500).optional()
});

// Schema para actualizar análisis de partido
export const updateMatchAnalysisSchema = z.object({
  match_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  opponent: z.string().min(2).max(255).optional(),
  competition: z.string().max(255).optional(),
  result: z.string().max(50).optional(),
  minutes_played: z.number().int().min(0).max(120).optional(),
  goals_conceded: z.number().int().min(0).optional(),
  saves: z.number().int().min(0).optional(),
  high_balls: z.number().int().min(0).optional(),
  crosses_caught: z.number().int().min(0).optional(),
  distribution_success_rate: z.number().min(0).max(100).optional(),
  rating: z.number().min(0).max(10).optional(),
  strengths: z.string().max(2000).optional(),
  areas_for_improvement: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  video_url: z.string().url().max(500).optional()
});

// Types
export type CreateMatchAnalysisInput = z.infer<typeof createMatchAnalysisSchema>;
export type UpdateMatchAnalysisInput = z.infer<typeof updateMatchAnalysisSchema>;
