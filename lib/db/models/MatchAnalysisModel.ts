import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface CreateMatchAnalysisDTO {
  goalkeeper_id: number;
  match_date: string;
  opponent: string;
  competition?: string;
  result?: string;
  minutes_played?: number;
  goals_conceded?: number;
  saves?: number;
  high_balls?: number;
  crosses_caught?: number;
  distribution_success_rate?: number;
  rating?: number;
  strengths?: string;
  areas_for_improvement?: string;
  notes?: string;
  video_url?: string;
  created_by: number;
}

export interface UpdateMatchAnalysisDTO {
  match_date?: string;
  opponent?: string;
  competition?: string;
  result?: string;
  minutes_played?: number;
  goals_conceded?: number;
  saves?: number;
  high_balls?: number;
  crosses_caught?: number;
  distribution_success_rate?: number;
  rating?: number;
  strengths?: string;
  areas_for_improvement?: string;
  notes?: string;
  video_url?: string;
}

export interface MatchAnalysis extends RowDataPacket {
  id: number;
  goalkeeper_id: number;
  match_date: string;
  opponent: string;
  competition: string | null;
  result: string | null;
  minutes_played: number | null;
  goals_conceded: number;
  saves: number;
  high_balls: number;
  crosses_caught: number;
  distribution_success_rate: number | null;
  rating: number | null;
  strengths: string | null;
  areas_for_improvement: string | null;
  notes: string | null;
  video_url: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  goalkeeper_name?: string;
}

export class MatchAnalysisModel {
  // Crear análisis de partido
  static async create(data: CreateMatchAnalysisDTO): Promise<MatchAnalysis> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO match_analysis 
       (goalkeeper_id, match_date, opponent, competition, result, minutes_played, 
        goals_conceded, saves, high_balls, crosses_caught, distribution_success_rate, 
        rating, strengths, areas_for_improvement, notes, video_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.goalkeeper_id,
        data.match_date,
        data.opponent,
        data.competition || null,
        data.result || null,
        data.minutes_played || null,
        data.goals_conceded || 0,
        data.saves || 0,
        data.high_balls || 0,
        data.crosses_caught || 0,
        data.distribution_success_rate || null,
        data.rating || null,
        data.strengths || null,
        data.areas_for_improvement || null,
        data.notes || null,
        data.video_url || null,
        data.created_by
      ]
    );

    return this.findById(result.insertId);
  }

  // Obtener por ID
  static async findById(id: number): Promise<MatchAnalysis> {
    const [rows] = await pool.execute<MatchAnalysis[]>(
      `SELECT m.*, CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name
       FROM match_analysis m
       LEFT JOIN goalkeepers g ON m.goalkeeper_id = g.id
       WHERE m.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Análisis no encontrado');
    }

    return rows[0];
  }

  // Obtener por portero
  static async findByGoalkeeper(goalkeeperId: number, limit?: number): Promise<MatchAnalysis[]> {
    let query = `SELECT m.*, CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name
       FROM match_analysis m
       LEFT JOIN goalkeepers g ON m.goalkeeper_id = g.id
       WHERE m.goalkeeper_id = ?
       ORDER BY m.match_date DESC, m.created_at DESC`;

    if (limit) {
      query += ` LIMIT ?`;
    }

    const params = limit ? [goalkeeperId, limit] : [goalkeeperId];

    const [rows] = await pool.execute<MatchAnalysis[]>(query, params);
    return rows;
  }

  // Obtener por usuario
  static async findByUser(userId: number): Promise<MatchAnalysis[]> {
    const [rows] = await pool.execute<MatchAnalysis[]>(
      `SELECT m.*, CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name
       FROM match_analysis m
       LEFT JOIN goalkeepers g ON m.goalkeeper_id = g.id
       WHERE m.created_by = ?
       ORDER BY m.match_date DESC, m.created_at DESC`,
      [userId]
    );

    return rows;
  }

  // Obtener por rango de fechas
  static async findByDateRange(userId: number, startDate: string, endDate: string): Promise<MatchAnalysis[]> {
    const [rows] = await pool.execute<MatchAnalysis[]>(
      `SELECT m.*, CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name
       FROM match_analysis m
       LEFT JOIN goalkeepers g ON m.goalkeeper_id = g.id
       WHERE m.created_by = ? AND m.match_date BETWEEN ? AND ?
       ORDER BY m.match_date DESC`,
      [userId, startDate, endDate]
    );

    return rows;
  }

  // Actualizar análisis
  static async update(id: number, data: UpdateMatchAnalysisDTO): Promise<MatchAnalysis> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.match_date !== undefined) {
      fields.push('match_date = ?');
      values.push(data.match_date);
    }
    if (data.opponent !== undefined) {
      fields.push('opponent = ?');
      values.push(data.opponent);
    }
    if (data.competition !== undefined) {
      fields.push('competition = ?');
      values.push(data.competition || null);
    }
    if (data.result !== undefined) {
      fields.push('result = ?');
      values.push(data.result || null);
    }
    if (data.minutes_played !== undefined) {
      fields.push('minutes_played = ?');
      values.push(data.minutes_played || null);
    }
    if (data.goals_conceded !== undefined) {
      fields.push('goals_conceded = ?');
      values.push(data.goals_conceded);
    }
    if (data.saves !== undefined) {
      fields.push('saves = ?');
      values.push(data.saves);
    }
    if (data.high_balls !== undefined) {
      fields.push('high_balls = ?');
      values.push(data.high_balls);
    }
    if (data.crosses_caught !== undefined) {
      fields.push('crosses_caught = ?');
      values.push(data.crosses_caught);
    }
    if (data.distribution_success_rate !== undefined) {
      fields.push('distribution_success_rate = ?');
      values.push(data.distribution_success_rate || null);
    }
    if (data.rating !== undefined) {
      fields.push('rating = ?');
      values.push(data.rating || null);
    }
    if (data.strengths !== undefined) {
      fields.push('strengths = ?');
      values.push(data.strengths || null);
    }
    if (data.areas_for_improvement !== undefined) {
      fields.push('areas_for_improvement = ?');
      values.push(data.areas_for_improvement || null);
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
      `UPDATE match_analysis SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Eliminar análisis
  static async delete(id: number): Promise<void> {
    await pool.execute('DELETE FROM match_analysis WHERE id = ?', [id]);
  }

  // Obtener estadísticas de un portero
  static async getGoalkeeperStats(goalkeeperId: number): Promise<{
    total_matches: number;
    total_minutes: number;
    total_goals_conceded: number;
    total_saves: number;
    total_high_balls: number;
    total_crosses: number;
    avg_rating: number;
    avg_distribution: number;
    clean_sheets: number;
  }> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_matches,
        COALESCE(SUM(minutes_played), 0) as total_minutes,
        COALESCE(SUM(goals_conceded), 0) as total_goals_conceded,
        COALESCE(SUM(saves), 0) as total_saves,
        COALESCE(SUM(high_balls), 0) as total_high_balls,
        COALESCE(SUM(crosses_caught), 0) as total_crosses,
        ROUND(AVG(rating), 2) as avg_rating,
        ROUND(AVG(distribution_success_rate), 2) as avg_distribution,
        SUM(CASE WHEN goals_conceded = 0 THEN 1 ELSE 0 END) as clean_sheets
      FROM match_analysis
      WHERE goalkeeper_id = ?`,
      [goalkeeperId]
    );

    return rows[0] as {
      total_matches: number;
      total_minutes: number;
      total_goals_conceded: number;
      total_saves: number;
      total_high_balls: number;
      total_crosses: number;
      avg_rating: number;
      avg_distribution: number;
      clean_sheets: number;
    };
  }

  // Obtener últimos partidos
  static async getRecentMatches(goalkeeperId: number, limit: number = 5): Promise<MatchAnalysis[]> {
    const [rows] = await pool.execute<MatchAnalysis[]>(
      `SELECT m.*, CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name
       FROM match_analysis m
       LEFT JOIN goalkeepers g ON m.goalkeeper_id = g.id
       WHERE m.goalkeeper_id = ?
       ORDER BY m.match_date DESC
       LIMIT ?`,
      [goalkeeperId, limit]
    );

    return rows;
  }

  // Contar análisis por portero
  static async countByGoalkeeper(goalkeeperId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM match_analysis WHERE goalkeeper_id = ?',
      [goalkeeperId]
    );

    return rows[0].count;
  }

  // Buscar por oponente
  static async searchByOpponent(userId: number, opponent: string): Promise<MatchAnalysis[]> {
    const [rows] = await pool.execute<MatchAnalysis[]>(
      `SELECT m.*, CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name
       FROM match_analysis m
       LEFT JOIN goalkeepers g ON m.goalkeeper_id = g.id
       WHERE m.created_by = ? AND m.opponent LIKE ?
       ORDER BY m.match_date DESC`,
      [userId, `%${opponent}%`]
    );

    return rows;
  }
}
