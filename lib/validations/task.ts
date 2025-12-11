import { z } from 'zod';

// Schema para crear tarea
export const createTaskSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres'),
  
  description: z.string()
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .optional()
    .nullable(),
  
  category: z.enum(['technical', 'tactical', 'physical', 'psychological', 'goalkeeper_specific'], {
    errorMap: () => ({ message: 'Categoría inválida' })
  }),
  
  subcategory: z.string()
    .max(100, 'La subcategoría no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  
  duration: z.number()
    .int('La duración debe ser un número entero')
    .min(1, 'La duración debe ser al menos 1 minuto')
    .max(300, 'La duración no puede exceder 300 minutos')
    .optional()
    .nullable(),
  
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'])
    .default('intermediate')
    .optional(),
  
  objectives: z.string()
    .max(2000, 'Los objetivos no pueden exceder 2000 caracteres')
    .optional()
    .nullable(),
  
  materials: z.string()
    .max(1000, 'Los materiales no pueden exceder 1000 caracteres')
    .optional()
    .nullable(),
  
  instructions: z.string()
    .max(5000, 'Las instrucciones no pueden exceder 5000 caracteres')
    .optional()
    .nullable(),
  
  video_url: z.string()
    .url('URL de video inválida')
    .max(500, 'La URL del video es demasiado larga')
    .optional()
    .nullable(),
  
  image_url: z.string()
    .url('URL de imagen inválida')
    .max(500, 'La URL de la imagen es demasiado larga')
    .optional()
    .nullable(),
  
  is_public: z.boolean()
    .default(false)
    .optional(),
});

// Schema para actualizar tarea (todos los campos opcionales excepto validaciones)
export const updateTaskSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres')
    .optional(),
  
  description: z.string()
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .optional()
    .nullable(),
  
  category: z.enum(['technical', 'tactical', 'physical', 'psychological', 'goalkeeper_specific'], {
    errorMap: () => ({ message: 'Categoría inválida' })
  }).optional(),
  
  subcategory: z.string()
    .max(100, 'La subcategoría no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  
  duration: z.number()
    .int('La duración debe ser un número entero')
    .min(1, 'La duración debe ser al menos 1 minuto')
    .max(300, 'La duración no puede exceder 300 minutos')
    .optional()
    .nullable(),
  
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'])
    .optional(),
  
  objectives: z.string()
    .max(2000, 'Los objetivos no pueden exceder 2000 caracteres')
    .optional()
    .nullable(),
  
  materials: z.string()
    .max(1000, 'Los materiales no pueden exceder 1000 caracteres')
    .optional()
    .nullable(),
  
  instructions: z.string()
    .max(5000, 'Las instrucciones no pueden exceder 5000 caracteres')
    .optional()
    .nullable(),
  
  video_url: z.string()
    .url('URL de video inválida')
    .max(500, 'La URL del video es demasiado larga')
    .optional()
    .nullable(),
  
  image_url: z.string()
    .url('URL de imagen inválida')
    .max(500, 'La URL de la imagen es demasiado larga')
    .optional()
    .nullable(),
  
  is_public: z.boolean()
    .optional(),
});

// Tipos TypeScript generados de los schemas
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
