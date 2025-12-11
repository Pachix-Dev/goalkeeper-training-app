import { z } from 'zod';

// Schema para crear estadísticas de portero
export const createStatisticsSchema = z.object({
  goalkeeper_id: z.number().int().positive({
    message: 'El ID del portero es requerido'
  }),
  season: z.string().min(1, {
    message: 'La temporada es requerida'
  }).regex(/^\d{4}(-\d{4})?$/, {
    message: 'Formato de temporada inválido (ej: 2024 o 2024-2025)'
  }),
  matches_played: z.number().int().min(0).optional().default(0),
  minutes_played: z.number().int().min(0).optional().default(0),
  goals_conceded: z.number().int().min(0).optional().default(0),
  clean_sheets: z.number().int().min(0).optional().default(0),
  saves: z.number().int().min(0).optional().default(0),
  penalties_saved: z.number().int().min(0).optional().default(0),
  penalties_faced: z.number().int().min(0).optional().default(0),
  yellow_cards: z.number().int().min(0).optional().default(0),
  red_cards: z.number().int().min(0).optional().default(0)
}).refine(
  (data) => data.clean_sheets <= data.matches_played,
  {
    message: 'Los partidos con portería a cero no pueden superar los partidos jugados',
    path: ['clean_sheets']
  }
).refine(
  (data) => data.penalties_saved <= data.penalties_faced,
  {
    message: 'Los penaltis detenidos no pueden superar los penaltis enfrentados',
    path: ['penalties_saved']
  }
);

// Schema para actualizar estadísticas de portero
export const updateStatisticsSchema = z.object({
  season: z.string().min(1).regex(/^\d{4}(-\d{4})?$/, {
    message: 'Formato de temporada inválido (ej: 2024 o 2024-2025)'
  }).optional(),
  matches_played: z.number().int().min(0).optional(),
  minutes_played: z.number().int().min(0).optional(),
  goals_conceded: z.number().int().min(0).optional(),
  clean_sheets: z.number().int().min(0).optional(),
  saves: z.number().int().min(0).optional(),
  penalties_saved: z.number().int().min(0).optional(),
  penalties_faced: z.number().int().min(0).optional(),
  yellow_cards: z.number().int().min(0).optional(),
  red_cards: z.number().int().min(0).optional()
}).refine(
  (data) => {
    if (data.clean_sheets !== undefined && data.matches_played !== undefined) {
      return data.clean_sheets <= data.matches_played;
    }
    return true;
  },
  {
    message: 'Los partidos con portería a cero no pueden superar los partidos jugados',
    path: ['clean_sheets']
  }
).refine(
  (data) => {
    if (data.penalties_saved !== undefined && data.penalties_faced !== undefined) {
      return data.penalties_saved <= data.penalties_faced;
    }
    return true;
  },
  {
    message: 'Los penaltis detenidos no pueden superar los penaltis enfrentados',
    path: ['penalties_saved']
  }
);

// Schema para comparar porteros
export const compareGoalkeepersSchema = z.object({
  goalkeeper_ids: z.array(z.number().int().positive()).min(2, {
    message: 'Se requieren al menos 2 porteros para comparar'
  }).max(5, {
    message: 'Máximo 5 porteros para comparar'
  }),
  season: z.string().min(1).regex(/^\d{4}(-\d{4})?$/, {
    message: 'Formato de temporada inválido'
  })
});
