import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface CreateSessionTaskDTO {
  session_id: number;
  task_id: number;
  order_number: number;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high' | 'very_high';
  notes?: string;
}

export interface UpdateSessionTaskDTO {
  order_number?: number;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high' | 'very_high';
  notes?: string;
}

export interface SessionTask extends RowDataPacket {
  id: number;
  session_id: number;
  task_id: number;
  order_number: number;
  duration: number | null;
  intensity: string | null;
  notes: string | null;
  created_at: string;
  task_title?: string;
  task_category?: string;
  task_difficulty?: string;
  design_id?: number | null;
  design_img?: string | null;
}

export class SessionTaskModel {
  // Agregar tarea a sesión
  static async addTask(data: CreateSessionTaskDTO): Promise<SessionTask> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO session_tasks 
       (session_id, task_id, order_number, duration, intensity, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.session_id,
        data.task_id,
        data.order_number,
        data.duration || null,
        data.intensity || null,
        data.notes || null
      ]
    );

    return this.findById(result.insertId);
  }

  // Obtener por ID
  static async findById(id: number): Promise<SessionTask> {
    const [rows] = await pool.execute<SessionTask[]>(
      `SELECT st.*, t.title as task_title, t.category as task_category, t.difficulty as task_difficulty,
       t.design_id, td.img as design_img
       FROM session_tasks st
       LEFT JOIN tasks t ON st.task_id = t.id
       LEFT JOIN training_designs td ON t.design_id = td.id
       WHERE st.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Tarea de sesión no encontrada');
    }

    return rows[0];
  }

  // Obtener tareas de una sesión
  static async findBySession(sessionId: number): Promise<SessionTask[]> {
    const [rows] = await pool.execute<SessionTask[]>(
      `SELECT st.*, t.title as task_title, t.category as task_category, 
       t.difficulty as task_difficulty, t.description as task_description,
       t.design_id, td.img as design_img
       FROM session_tasks st
       LEFT JOIN tasks t ON st.task_id = t.id
       LEFT JOIN training_designs td ON t.design_id = td.id
       WHERE st.session_id = ?
       ORDER BY st.order_number ASC`,
      [sessionId]
    );

    return rows;
  }

  // Actualizar tarea de sesión
  static async update(id: number, data: UpdateSessionTaskDTO): Promise<SessionTask> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.order_number !== undefined) {
      fields.push('order_number = ?');
      values.push(data.order_number);
    }
    if (data.duration !== undefined) {
      fields.push('duration = ?');
      values.push(data.duration || null);
    }
    if (data.intensity !== undefined) {
      fields.push('intensity = ?');
      values.push(data.intensity || null);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes || null);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    await pool.execute(
      `UPDATE session_tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Eliminar tarea de sesión
  static async delete(id: number): Promise<void> {
    await pool.execute('DELETE FROM session_tasks WHERE id = ?', [id]);
  }

  // Reordenar tareas de una sesión
  static async reorder(sessionId: number, taskOrders: { id: number; order_number: number }[]): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      for (const taskOrder of taskOrders) {
        await connection.execute(
          'UPDATE session_tasks SET order_number = ? WHERE id = ? AND session_id = ?',
          [taskOrder.order_number, taskOrder.id, sessionId]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener siguiente número de orden
  static async getNextOrderNumber(sessionId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COALESCE(MAX(order_number), 0) + 1 as next_order FROM session_tasks WHERE session_id = ?',
      [sessionId]
    );

    return rows[0].next_order;
  }

  // Eliminar todas las tareas de una sesión
  static async deleteBySession(sessionId: number): Promise<void> {
    await pool.execute('DELETE FROM session_tasks WHERE session_id = ?', [sessionId]);
  }

  // Contar tareas de una sesión
  static async countBySession(sessionId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM session_tasks WHERE session_id = ?',
      [sessionId]
    );

    return rows[0].count;
  }

  // Obtener duración total de tareas de una sesión
  static async getTotalDuration(sessionId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COALESCE(SUM(duration), 0) as total_duration FROM session_tasks WHERE session_id = ?',
      [sessionId]
    );

    return rows[0].total_duration;
  }
}
