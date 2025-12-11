import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface CreateSessionDTO {
  title: string;
  description?: string;
  session_date: string; // YYYY-MM-DD
  start_time?: string; // HH:MM:SS
  end_time?: string; // HH:MM:SS
  location?: string;
  team_id: number;
  user_id: number;
  session_type?: 'training' | 'match' | 'recovery' | 'tactical' | 'physical';
  status?: 'planned' | 'completed' | 'cancelled';
  notes?: string;
  weather?: string;
}

export interface UpdateSessionDTO {
  title?: string;
  description?: string;
  session_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  session_type?: 'training' | 'match' | 'recovery' | 'tactical' | 'physical';
  status?: 'planned' | 'completed' | 'cancelled';
  notes?: string;
  weather?: string;
}

export interface TrainingSession extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  team_id: number;
  user_id: number;
  session_type: string;
  status: string;
  notes: string | null;
  weather: string | null;
  created_at: string;
  updated_at: string;
  team_name?: string;
  task_count?: number;
}

export class TrainingSessionModel {
  // Crear sesión
  static async create(data: CreateSessionDTO): Promise<TrainingSession> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO training_sessions 
       (title, description, session_date, start_time, end_time, location, team_id, user_id, session_type, status, notes, weather)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description || null,
        data.session_date,
        data.start_time || null,
        data.end_time || null,
        data.location || null,
        data.team_id,
        data.user_id,
        data.session_type || 'training',
        data.status || 'planned',
        data.notes || null,
        data.weather || null
      ]
    );

    return this.findById(result.insertId);
  }

  // Obtener por ID
  static async findById(id: number): Promise<TrainingSession> {
    const [rows] = await pool.execute<TrainingSession[]>(
      `SELECT ts.*, t.name as team_name,
       (SELECT COUNT(*) FROM session_tasks WHERE session_id = ts.id) as task_count
       FROM training_sessions ts
       LEFT JOIN teams t ON ts.team_id = t.id
       WHERE ts.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Sesión no encontrada');
    }

    return rows[0];
  }

  // Obtener sesiones por equipo
  static async findByTeam(teamId: number, userId: number): Promise<TrainingSession[]> {
    const [rows] = await pool.execute<TrainingSession[]>(
      `SELECT ts.*, t.name as team_name,
       (SELECT COUNT(*) FROM session_tasks WHERE session_id = ts.id) as task_count
       FROM training_sessions ts
       LEFT JOIN teams t ON ts.team_id = t.id
       WHERE ts.team_id = ? AND ts.user_id = ?
       ORDER BY ts.session_date DESC, ts.start_time DESC`,
      [teamId, userId]
    );

    return rows;
  }

  // Obtener sesiones por usuario
  static async findByUser(userId: number): Promise<TrainingSession[]> {
    const [rows] = await pool.execute<TrainingSession[]>(
      `SELECT ts.*, t.name as team_name,
       (SELECT COUNT(*) FROM session_tasks WHERE session_id = ts.id) as task_count
       FROM training_sessions ts
       LEFT JOIN teams t ON ts.team_id = t.id
       WHERE ts.user_id = ?
       ORDER BY ts.session_date DESC, ts.start_time DESC`,
      [userId]
    );

    return rows;
  }

  // Obtener sesiones por rango de fechas
  static async findByDateRange(
    userId: number,
    startDate: string,
    endDate: string,
    teamId?: number
  ): Promise<TrainingSession[]> {
    let query = `SELECT ts.*, t.name as team_name,
       (SELECT COUNT(*) FROM session_tasks WHERE session_id = ts.id) as task_count
       FROM training_sessions ts
       LEFT JOIN teams t ON ts.team_id = t.id
       WHERE ts.user_id = ? AND ts.session_date BETWEEN ? AND ?`;
    
    const params: any[] = [userId, startDate, endDate];

    if (teamId) {
      query += ' AND ts.team_id = ?';
      params.push(teamId);
    }

    query += ' ORDER BY ts.session_date ASC, ts.start_time ASC';

    const [rows] = await pool.execute<TrainingSession[]>(query, params);
    return rows;
  }

  // Obtener próximas sesiones
  static async findUpcoming(userId: number, limit: number = 10): Promise<TrainingSession[]> {
    const [rows] = await pool.execute<TrainingSession[]>(
      `SELECT ts.*, t.name as team_name,
       (SELECT COUNT(*) FROM session_tasks WHERE session_id = ts.id) as task_count
       FROM training_sessions ts
       LEFT JOIN teams t ON ts.team_id = t.id
       WHERE ts.user_id = ? AND ts.session_date >= CURDATE() AND ts.status = 'planned'
       ORDER BY ts.session_date ASC, ts.start_time ASC
       LIMIT ?`,
      [userId, limit]
    );

    return rows;
  }

  // Actualizar sesión
  static async update(id: number, data: UpdateSessionDTO): Promise<TrainingSession> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description || null);
    }
    if (data.session_date !== undefined) {
      fields.push('session_date = ?');
      values.push(data.session_date);
    }
    if (data.start_time !== undefined) {
      fields.push('start_time = ?');
      values.push(data.start_time || null);
    }
    if (data.end_time !== undefined) {
      fields.push('end_time = ?');
      values.push(data.end_time || null);
    }
    if (data.location !== undefined) {
      fields.push('location = ?');
      values.push(data.location || null);
    }
    if (data.session_type !== undefined) {
      fields.push('session_type = ?');
      values.push(data.session_type);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes || null);
    }
    if (data.weather !== undefined) {
      fields.push('weather = ?');
      values.push(data.weather || null);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    await pool.execute(
      `UPDATE training_sessions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Eliminar sesión
  static async delete(id: number): Promise<void> {
    await pool.execute('DELETE FROM training_sessions WHERE id = ?', [id]);
  }

  // Contar sesiones por equipo
  static async countByTeam(teamId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM training_sessions WHERE team_id = ?',
      [teamId]
    );

    return rows[0].count;
  }

  // Contar sesiones por usuario
  static async countByUser(userId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM training_sessions WHERE user_id = ?',
      [userId]
    );

    return rows[0].count;
  }

  // Obtener estadísticas de sesiones
  static async getStats(userId: number, teamId?: number): Promise<any> {
    let query = `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) as planned,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN session_type = 'training' THEN 1 ELSE 0 END) as training_sessions,
        SUM(CASE WHEN session_type = 'match' THEN 1 ELSE 0 END) as match_sessions,
        SUM(CASE WHEN session_type = 'recovery' THEN 1 ELSE 0 END) as recovery_sessions,
        SUM(CASE WHEN session_type = 'tactical' THEN 1 ELSE 0 END) as tactical_sessions,
        SUM(CASE WHEN session_type = 'physical' THEN 1 ELSE 0 END) as physical_sessions
      FROM training_sessions
      WHERE user_id = ?`;

    const params: any[] = [userId];

    if (teamId) {
      query += ' AND team_id = ?';
      params.push(teamId);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows[0];
  }
}
