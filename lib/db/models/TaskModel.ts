import { query } from '../connection';
import { Task } from '@/lib/types/database';

export interface CreateTaskDTO {
  title: string;
  description?: string | null;
  category: 'technical' | 'tactical' | 'physical' | 'psychological' | 'goalkeeper_specific';
  subcategory?: string | null;
  duration?: number | null;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  objectives?: string | null;
  materials?: string | null;
  instructions?: string | null;
  video_url?: string | null;
  image_url?: string | null;
  design_id?: number | null;
  user_id: number;
  is_public?: boolean;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string | null;
  category?: 'technical' | 'tactical' | 'physical' | 'psychological' | 'goalkeeper_specific';
  subcategory?: string | null;
  duration?: number | null;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  objectives?: string | null;
  materials?: string | null;
  instructions?: string | null;
  video_url?: string | null;
  image_url?: string | null;
  design_id?: number | null;
  is_public?: boolean;
}

export class TaskModel {
  // Crear tarea
  static async create(data: CreateTaskDTO): Promise<Task> {
    const sql = `
      INSERT INTO tasks 
      (title, description, category, subcategory, duration, difficulty, 
       objectives, materials, instructions, video_url, image_url, design_id, user_id, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result: any = await query(sql, [
      data.title,
      data.description || null,
      data.category,
      data.subcategory || null,
      data.duration || null,
      data.difficulty || 'intermediate',
      data.objectives || null,
      data.materials || null,
      data.instructions || null,
      data.video_url || null,
      data.image_url || null,
      data.design_id || null,
      data.user_id,
      data.is_public || false
    ]);
    
    const task = await this.findById(result.insertId);
    if (!task) {
      throw new Error('Failed to create task');
    }
    return task;
  }

  // Buscar por ID
  static async findById(id: number): Promise<Task | null> {
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    const results: Task[] = await query(sql, [id]);
    return results[0] || null;
  }

  // Buscar por ID con diseño asociado
  static async findByIdWithDesign(id: number): Promise<Task & { design?: any } | null> {
    const sql = `
      SELECT 
        t.*,
        td.id as design_id_full,
        td.title as design_title,
        td.data as design_data,
        td.created_at as design_created_at
      FROM tasks t
      LEFT JOIN training_designs td ON t.design_id = td.id
      WHERE t.id = ?
    `;
    const results: any[] = await query(sql, [id]);
    
    if (!results[0]) return null;
    
    const row = results[0];
    const task: any = {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      subcategory: row.subcategory,
      duration: row.duration,
      difficulty: row.difficulty,
      objectives: row.objectives,
      materials: row.materials,
      instructions: row.instructions,
      video_url: row.video_url,
      image_url: row.image_url,
      design_id: row.design_id,
      user_id: row.user_id,
      is_public: row.is_public,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
    
    if (row.design_id_full) {
      task.design = {
        id: row.design_id_full,
        title: row.design_title,
        data: row.design_data,
        created_at: row.design_created_at
      };
    }
    
    return task;
  }

  // Buscar por usuario (tareas propias)
  static async findByUser(userId: number): Promise<Task[]> {
    const sql = `
      SELECT * FROM tasks 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    return query<Task[]>(sql, [userId]);
  }

  // Buscar tareas públicas y propias
  static async findAvailable(userId: number): Promise<Task[]> {
    const sql = `
      SELECT * FROM tasks 
      WHERE user_id = ? OR is_public = TRUE
      ORDER BY created_at DESC
    `;
    return query<Task[]>(sql, [userId]);
  }

  // Buscar por categoría
  static async findByCategory(userId: number, category: string): Promise<Task[]> {
    const sql = `
      SELECT * FROM tasks 
      WHERE (user_id = ? OR is_public = TRUE) AND category = ?
      ORDER BY created_at DESC
    `;
    return query<Task[]>(sql, [userId, category]);
  }

  // Búsqueda con FULLTEXT
  static async search(userId: number, searchTerm: string): Promise<Task[]> {
    const sql = `
      SELECT * FROM tasks 
      WHERE (user_id = ? OR is_public = TRUE)
        AND MATCH(title, description, objectives) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY created_at DESC
    `;
    return query<Task[]>(sql, [userId, searchTerm]);
  }

  // Búsqueda simple (alternativa si FULLTEXT falla)
  static async searchSimple(userId: number, searchTerm: string): Promise<Task[]> {
    const sql = `
      SELECT * FROM tasks 
      WHERE (user_id = ? OR is_public = TRUE)
        AND (title LIKE ? OR description LIKE ? OR objectives LIKE ?)
      ORDER BY created_at DESC
    `;
    const searchPattern = `%${searchTerm}%`;
    return query<Task[]>(sql, [userId, searchPattern, searchPattern, searchPattern]);
  }

  // Actualizar tarea
  static async update(id: number, data: UpdateTaskDTO): Promise<Task> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.category !== undefined) {
      fields.push('category = ?');
      values.push(data.category);
    }
    if (data.subcategory !== undefined) {
      fields.push('subcategory = ?');
      values.push(data.subcategory);
    }
    if (data.duration !== undefined) {
      fields.push('duration = ?');
      values.push(data.duration);
    }
    if (data.difficulty !== undefined) {
      fields.push('difficulty = ?');
      values.push(data.difficulty);
    }
    if (data.objectives !== undefined) {
      fields.push('objectives = ?');
      values.push(data.objectives);
    }
    if (data.materials !== undefined) {
      fields.push('materials = ?');
      values.push(data.materials);
    }
    if (data.instructions !== undefined) {
      fields.push('instructions = ?');
      values.push(data.instructions);
    }
    if (data.video_url !== undefined) {
      fields.push('video_url = ?');
      values.push(data.video_url);
    }
    if (data.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(data.image_url);
    }
    if (data.design_id !== undefined) {
      fields.push('design_id = ?');
      values.push(data.design_id);
    }
    if (data.is_public !== undefined) {
      fields.push('is_public = ?');
      values.push(data.is_public);
    }

    values.push(id);

    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);

    const task = await this.findById(id);
    if (!task) {
      throw new Error('Task not found after update');
    }
    return task;
  }

  // Eliminar tarea
  static async delete(id: number): Promise<void> {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    await query(sql, [id]);
  }

  // Contar tareas por usuario
  static async countByUser(userId: number): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM tasks WHERE user_id = ?';
    const result: any = await query(sql, [userId]);
    return result[0].count;
  }

  // Contar tareas públicas
  static async countPublic(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM tasks WHERE is_public = TRUE';
    const result: any = await query(sql);
    return result[0].count;
  }
}
