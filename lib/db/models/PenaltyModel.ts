import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface CreatePenaltyDTO {
  goalkeeper_id: number;
  opponent_name: string;
  match_date?: string;
  competition?: string;
  penalty_taker: string;
  taker_foot?: 'left' | 'right';
  shot_direction: 'left' | 'center' | 'right';
  shot_height: 'low' | 'mid' | 'high';
  result: 'saved' | 'goal' | 'missed' | 'post';
  goalkeeper_direction?: 'left' | 'center' | 'right' | 'stayed';
  notes?: string;
  video_url?: string;
  created_by: number;
}

export interface UpdatePenaltyDTO {
  opponent_name?: string;
  match_date?: string;
  competition?: string;
  penalty_taker?: string;
  taker_foot?: 'left' | 'right';
  shot_direction?: 'left' | 'center' | 'right';
  shot_height?: 'low' | 'mid' | 'high';
  result?: 'saved' | 'goal' | 'missed' | 'post';
  goalkeeper_direction?: 'left' | 'center' | 'right' | 'stayed';
  notes?: string;
  video_url?: string;
}

export interface Penalty extends RowDataPacket {
  id: number;
  goalkeeper_id: number;
  opponent_name: string;
  match_date: string | null;
  competition: string | null;
  penalty_taker: string;
  taker_foot: string | null;
  shot_direction: string;
  shot_height: string;
  result: string;
  goalkeeper_direction: string | null;
  notes: string | null;
  video_url: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  goalkeeper_name?: string;
}

export class PenaltyModel {
  // Crear penalti
  static async create(data: CreatePenaltyDTO): Promise<Penalty> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO penalties 
       (goalkeeper_id, opponent_name, match_date, competition, penalty_taker, taker_foot, 
        shot_direction, shot_height, result, goalkeeper_direction, notes, video_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.goalkeeper_id,
        data.opponent_name,
        data.match_date || null,
        data.competition || null,
        data.penalty_taker,
        data.taker_foot || null,
        data.shot_direction,
        data.shot_height,
        data.result,
        data.goalkeeper_direction || null,
        data.notes || null,
        data.video_url || null,
        data.created_by
      ]
    );

    return this.findById(result.insertId);
  }

  // Obtener por ID
  static async findById(id: number): Promise<Penalty> {
    const [rows] = await pool.execute<Penalty[]>(
      `SELECT p.*, CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name
       FROM penalties p
       LEFT JOIN goalkeepers g ON p.goalkeeper_id = g.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Penalti no encontrado');
    }

    return rows[0];
  }

  // Obtener penaltis por portero
  static async findByGoalkeeper(goalkeeperId: number, limit?: number): Promise<Penalty[]> {
    let query = `SELECT p.*, CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name
       FROM penalties p
       LEFT JOIN goalkeepers g ON p.goalkeeper_id = g.id
       WHERE p.goalkeeper_id = ?
       ORDER BY p.match_date DESC, p.created_at DESC`;

    if (limit) {
      query += ` LIMIT ?`;
    }

    const params = limit ? [goalkeeperId, limit] : [goalkeeperId];

    const [rows] = await pool.execute<Penalty[]>(query, params);
    return rows;
  }

  // Obtener penaltis por usuario
  static async findByUser(userId: number): Promise<Penalty[]> {
    const [rows] = await pool.execute<Penalty[]>(
      `SELECT p.*, CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name
       FROM penalties p
       LEFT JOIN goalkeepers g ON p.goalkeeper_id = g.id
       WHERE p.created_by = ?
       ORDER BY p.match_date DESC, p.created_at DESC`,
      [userId]
    );

    return rows;
  }

  // Buscar por lanzador
  static async findByKicker(userId: number, kickerName: string): Promise<Penalty[]> {
    const [rows] = await pool.execute<Penalty[]>(
      `SELECT p.*, CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name
       FROM penalties p
       LEFT JOIN goalkeepers g ON p.goalkeeper_id = g.id
       WHERE p.created_by = ? AND p.penalty_taker LIKE ?
       ORDER BY p.match_date DESC, p.created_at DESC`,
      [userId, `%${kickerName}%`]
    );

    return rows;
  }

  // Actualizar penalti
  static async update(id: number, data: UpdatePenaltyDTO): Promise<Penalty> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.opponent_name !== undefined) {
      fields.push('opponent_name = ?');
      values.push(data.opponent_name);
    }
    if (data.match_date !== undefined) {
      fields.push('match_date = ?');
      values.push(data.match_date || null);
    }
    if (data.competition !== undefined) {
      fields.push('competition = ?');
      values.push(data.competition || null);
    }
    if (data.penalty_taker !== undefined) {
      fields.push('penalty_taker = ?');
      values.push(data.penalty_taker);
    }
    if (data.taker_foot !== undefined) {
      fields.push('taker_foot = ?');
      values.push(data.taker_foot || null);
    }
    if (data.shot_direction !== undefined) {
      fields.push('shot_direction = ?');
      values.push(data.shot_direction);
    }
    if (data.shot_height !== undefined) {
      fields.push('shot_height = ?');
      values.push(data.shot_height);
    }
    if (data.result !== undefined) {
      fields.push('result = ?');
      values.push(data.result);
    }
    if (data.goalkeeper_direction !== undefined) {
      fields.push('goalkeeper_direction = ?');
      values.push(data.goalkeeper_direction || null);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes || null);
    }
    if (data.video_url !== undefined) {
      fields.push('video_url = ?');
      values.push(data.video_url || null);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    await pool.execute(
      `UPDATE penalties SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Eliminar penalti
  static async delete(id: number): Promise<void> {
    await pool.execute('DELETE FROM penalties WHERE id = ?', [id]);
  }

  // Obtener estadísticas por portero
  static async getGoalkeeperStats(goalkeeperId: number): Promise<any> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_penalties,
        SUM(CASE WHEN result = 'saved' THEN 1 ELSE 0 END) as saved,
        SUM(CASE WHEN result = 'goal' THEN 1 ELSE 0 END) as conceded,
        SUM(CASE WHEN result = 'missed' THEN 1 ELSE 0 END) as missed,
        SUM(CASE WHEN result = 'post' THEN 1 ELSE 0 END) as post,
        ROUND((SUM(CASE WHEN result = 'saved' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 2) as save_percentage
      FROM penalties
      WHERE goalkeeper_id = ?`,
      [goalkeeperId]
    );

    return rows[0];
  }

  // Obtener tendencias de lanzador
  static async getKickerTendencies(userId: number, kickerName: string): Promise<any> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        penalty_taker,
        taker_foot,
        COUNT(*) as total_penalties,
        SUM(CASE WHEN shot_direction = 'left' THEN 1 ELSE 0 END) as direction_left,
        SUM(CASE WHEN shot_direction = 'center' THEN 1 ELSE 0 END) as direction_center,
        SUM(CASE WHEN shot_direction = 'right' THEN 1 ELSE 0 END) as direction_right,
        SUM(CASE WHEN shot_height = 'low' THEN 1 ELSE 0 END) as height_low,
        SUM(CASE WHEN shot_height = 'mid' THEN 1 ELSE 0 END) as height_mid,
        SUM(CASE WHEN shot_height = 'high' THEN 1 ELSE 0 END) as height_high,
        SUM(CASE WHEN result = 'goal' THEN 1 ELSE 0 END) as goals,
        SUM(CASE WHEN result = 'saved' THEN 1 ELSE 0 END) as saved,
        SUM(CASE WHEN result = 'missed' THEN 1 ELSE 0 END) as missed,
        SUM(CASE WHEN result = 'post' THEN 1 ELSE 0 END) as post
      FROM penalties
      WHERE created_by = ? AND penalty_taker LIKE ?
      GROUP BY penalty_taker, taker_foot`,
      [userId, `%${kickerName}%`]
    );

    return rows;
  }

  // Obtener distribución de tiros
  static async getShotDistribution(goalkeeperId: number): Promise<any> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        shot_direction,
        shot_height,
        COUNT(*) as count,
        SUM(CASE WHEN result = 'saved' THEN 1 ELSE 0 END) as saved,
        SUM(CASE WHEN result = 'goal' THEN 1 ELSE 0 END) as conceded
      FROM penalties
      WHERE goalkeeper_id = ?
      GROUP BY shot_direction, shot_height
      ORDER BY shot_direction, shot_height`,
      [goalkeeperId]
    );

    return rows;
  }

  // Contar penaltis por portero
  static async countByGoalkeeper(goalkeeperId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM penalties WHERE goalkeeper_id = ?',
      [goalkeeperId]
    );

    return rows[0].count;
  }
}
