import { z } from 'zod';

// Schema para crear portero
export const createGoalkeeperSchema = z.object({
  first_name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  last_name: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  
  date_of_birth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional()
    .nullable(),
  
  height: z.number()
    .min(100, 'La altura debe ser mayor a 100 cm')
    .max(250, 'La altura debe ser menor a 250 cm')
    .optional()
    .nullable(),
  
  weight: z.number()
    .min(30, 'El peso debe ser mayor a 30 kg')
    .max(200, 'El peso debe ser menor a 200 kg')
    .optional()
    .nullable(),
  
  nationality: z.string()
    .max(100, 'La nacionalidad no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  
  photo: z.string()
    .url('URL de foto inválida')
    .max(500, 'La URL de la foto es demasiado larga')
    .optional()
    .nullable(),
  
  dominant_hand: z.enum(['left', 'right', 'both'])
    .optional()
    .nullable(),
  
  team_id: z.number()
    .int('El ID del equipo debe ser un número entero')
    .positive('El ID del equipo debe ser positivo')
    .optional()
    .nullable(),
  
  jersey_number: z.number()
    .int('El número de camiseta debe ser un entero')
    .min(0, 'El número debe ser mayor o igual a 0')
    .max(99, 'El número debe ser menor o igual a 99')
    .optional()
    .nullable(),
  
  notes: z.string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .nullable(),
});

// Schema para actualizar portero (todos los campos opcionales)
export const updateGoalkeeperSchema = z.object({
  first_name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  
  last_name: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .optional(),
  
  date_of_birth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional()
    .nullable(),
  
  height: z.number()
    .min(100, 'La altura debe ser mayor a 100 cm')
    .max(250, 'La altura debe ser menor a 250 cm')
    .optional()
    .nullable(),
  
  weight: z.number()
    .min(30, 'El peso debe ser mayor a 30 kg')
    .max(200, 'El peso debe ser menor a 200 kg')
    .optional()
    .nullable(),
  
  nationality: z.string()
    .max(100, 'La nacionalidad no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  
  photo: z.string()
    .url('URL de foto inválida')
    .max(500, 'La URL de la foto es demasiado larga')
    .optional()
    .nullable(),
  
  dominant_hand: z.enum(['left', 'right', 'both'])
    .optional()
    .nullable(),
  
  team_id: z.number()
    .int('El ID del equipo debe ser un número entero')
    .positive('El ID del equipo debe ser positivo')
    .optional()
    .nullable(),
  
  jersey_number: z.number()
    .int('El número de camiseta debe ser un entero')
    .min(0, 'El número debe ser mayor o igual a 0')
    .max(99, 'El número debe ser menor o igual a 99')
    .optional()
    .nullable(),
  
  notes: z.string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .nullable(),
  
  is_active: z.boolean()
    .optional(),
});

// Tipos TypeScript generados de los schemas
export type CreateGoalkeeperInput = z.infer<typeof createGoalkeeperSchema>;
export type UpdateGoalkeeperInput = z.infer<typeof updateGoalkeeperSchema>;
