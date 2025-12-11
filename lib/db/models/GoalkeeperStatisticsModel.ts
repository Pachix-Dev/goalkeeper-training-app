import pool from '../connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface GoalkeeperStatistics extends RowDataPacket {
  id: number;
  goalkeeper_id: number;
  season: string;
  matches_played: number;
  minutes_played: number;
  goals_conceded: number;
  clean_sheets: number;
  saves: number;
  penalties_saved: number;
  penalties_faced: number;
  yellow_cards: number;
  red_cards: number;
  created_at: Date;
  updated_at: Date;
  // Campos calculados
  goals_per_match?: number;
  clean_sheet_percentage?: number;
  save_percentage?: number;
  penalty_save_percentage?: number;
  // Datos del portero (para joins)
  goalkeeper_name?: string;
  team_name?: string;
}

export interface CreateGoalkeeperStatisticsDTO {
  goalkeeper_id: number;
  season: string;
  matches_played?: number;
  minutes_played?: number;
  goals_conceded?: number;
  clean_sheets?: number;
  saves?: number;
  penalties_saved?: number;
  penalties_faced?: number;
  yellow_cards?: number;
  red_cards?: number;
}

export interface UpdateGoalkeeperStatisticsDTO {
  season?: string;
  matches_played?: number;
  minutes_played?: number;
  goals_conceded?: number;
  clean_sheets?: number;
  saves?: number;
  penalties_saved?: number;
  penalties_faced?: number;
  yellow_cards?: number;
  red_cards?: number;
}

export interface ComparisonResult {
  goalkeeper_id: number;
  goalkeeper_name: string;
  season: string;
  matches_played: number;
  goals_conceded: number;
  clean_sheets: number;
  saves: number;
  goals_per_match: number;
  clean_sheet_percentage: number;
  save_percentage: number;
}

export class GoalkeeperStatisticsModel {
  // Crear estadísticas
  static async create(data: CreateGoalkeeperStatisticsDTO): Promise<GoalkeeperStatistics> {
    const query = `
      INSERT INTO goalkeeper_statistics (
        goalkeeper_id, season, matches_played, minutes_played, 
        goals_conceded, clean_sheets, saves, penalties_saved, 
        penalties_faced, yellow_cards, red_cards
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.goalkeeper_id,
      data.season,
      data.matches_played || 0,
      data.minutes_played || 0,
      data.goals_conceded || 0,
      data.clean_sheets || 0,
      data.saves || 0,
      data.penalties_saved || 0,
      data.penalties_faced || 0,
      data.yellow_cards || 0,
      data.red_cards || 0
    ];

    const [result] = await pool.query<ResultSetHeader>(query, values);
    return this.findById(result.insertId);
  }

  // Obtener por ID con datos calculados
  static async findById(id: number): Promise<GoalkeeperStatistics> {
    const query = `
      SELECT 
        gs.*,
        CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name,
        t.name as team_name,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND(gs.goals_conceded / gs.matches_played, 2)
          ELSE 0 
        END as goals_per_match,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND((gs.clean_sheets / gs.matches_played) * 100, 2)
          ELSE 0 
        END as clean_sheet_percentage,
        CASE 
          WHEN (gs.saves + gs.goals_conceded) > 0 
          THEN ROUND((gs.saves / (gs.saves + gs.goals_conceded)) * 100, 2)
          ELSE 0 
        END as save_percentage,
        CASE 
          WHEN gs.penalties_faced > 0 
          THEN ROUND((gs.penalties_saved / gs.penalties_faced) * 100, 2)
          ELSE 0 
        END as penalty_save_percentage
      FROM goalkeeper_statistics gs
      LEFT JOIN goalkeepers g ON gs.goalkeeper_id = g.id
      LEFT JOIN teams t ON g.team_id = t.id
      WHERE gs.id = ?
    `;

    const [rows] = await pool.query<GoalkeeperStatistics[]>(query, [id]);

    if (rows.length === 0) {
      throw new Error('Estadísticas no encontradas');
    }

    return rows[0];
  }

  // Obtener todas las estadísticas de un portero
  static async findByGoalkeeper(goalkeeperId: number): Promise<GoalkeeperStatistics[]> {
    const query = `
      SELECT 
        gs.*,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND(gs.goals_conceded / gs.matches_played, 2)
          ELSE 0 
        END as goals_per_match,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND((gs.clean_sheets / gs.matches_played) * 100, 2)
          ELSE 0 
        END as clean_sheet_percentage,
        CASE 
          WHEN (gs.saves + gs.goals_conceded) > 0 
          THEN ROUND((gs.saves / (gs.saves + gs.goals_conceded)) * 100, 2)
          ELSE 0 
        END as save_percentage,
        CASE 
          WHEN gs.penalties_faced > 0 
          THEN ROUND((gs.penalties_saved / gs.penalties_faced) * 100, 2)
          ELSE 0 
        END as penalty_save_percentage
      FROM goalkeeper_statistics gs
      WHERE gs.goalkeeper_id = ?
      ORDER BY gs.season DESC
    `;

    const [rows] = await pool.query<GoalkeeperStatistics[]>(query, [goalkeeperId]);
    return rows;
  }

  // Obtener estadísticas por equipo y temporada
  static async findByTeam(teamId: number, season?: string): Promise<GoalkeeperStatistics[]> {
    let query = `
      SELECT 
        gs.*,
        CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND(gs.goals_conceded / gs.matches_played, 2)
          ELSE 0 
        END as goals_per_match,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND((gs.clean_sheets / gs.matches_played) * 100, 2)
          ELSE 0 
        END as clean_sheet_percentage,
        CASE 
          WHEN (gs.saves + gs.goals_conceded) > 0 
          THEN ROUND((gs.saves / (gs.saves + gs.goals_conceded)) * 100, 2)
          ELSE 0 
        END as save_percentage
      FROM goalkeeper_statistics gs
      INNER JOIN goalkeepers g ON gs.goalkeeper_id = g.id
      WHERE g.team_id = ?
    `;

    const values: (number | string)[] = [teamId];

    if (season) {
      query += ' AND gs.season = ?';
      values.push(season);
    }

    query += ' ORDER BY gs.season DESC, goalkeeper_name';

    const [rows] = await pool.query<GoalkeeperStatistics[]>(query, values);
    return rows;
  }

  // Obtener estadísticas por temporada
  static async findBySeason(season: string): Promise<GoalkeeperStatistics[]> {
    const query = `
      SELECT 
        gs.*,
        CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name,
        t.name as team_name,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND(gs.goals_conceded / gs.matches_played, 2)
          ELSE 0 
        END as goals_per_match,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND((gs.clean_sheets / gs.matches_played) * 100, 2)
          ELSE 0 
        END as clean_sheet_percentage,
        CASE 
          WHEN (gs.saves + gs.goals_conceded) > 0 
          THEN ROUND((gs.saves / (gs.saves + gs.goals_conceded)) * 100, 2)
          ELSE 0 
        END as save_percentage
      FROM goalkeeper_statistics gs
      INNER JOIN goalkeepers g ON gs.goalkeeper_id = g.id
      LEFT JOIN teams t ON g.team_id = t.id
      WHERE gs.season = ?
      ORDER BY gs.matches_played DESC, goalkeeper_name
    `;

    const [rows] = await pool.query<GoalkeeperStatistics[]>(query, [season]);
    return rows;
  }

  // Actualizar estadísticas
  static async update(id: number, data: UpdateGoalkeeperStatisticsDTO): Promise<GoalkeeperStatistics> {
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data.season !== undefined) {
      updates.push('season = ?');
      values.push(data.season);
    }
    if (data.matches_played !== undefined) {
      updates.push('matches_played = ?');
      values.push(data.matches_played);
    }
    if (data.minutes_played !== undefined) {
      updates.push('minutes_played = ?');
      values.push(data.minutes_played);
    }
    if (data.goals_conceded !== undefined) {
      updates.push('goals_conceded = ?');
      values.push(data.goals_conceded);
    }
    if (data.clean_sheets !== undefined) {
      updates.push('clean_sheets = ?');
      values.push(data.clean_sheets);
    }
    if (data.saves !== undefined) {
      updates.push('saves = ?');
      values.push(data.saves);
    }
    if (data.penalties_saved !== undefined) {
      updates.push('penalties_saved = ?');
      values.push(data.penalties_saved);
    }
    if (data.penalties_faced !== undefined) {
      updates.push('penalties_faced = ?');
      values.push(data.penalties_faced);
    }
    if (data.yellow_cards !== undefined) {
      updates.push('yellow_cards = ?');
      values.push(data.yellow_cards);
    }
    if (data.red_cards !== undefined) {
      updates.push('red_cards = ?');
      values.push(data.red_cards);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE goalkeeper_statistics
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    await pool.query(query, values);
    return this.findById(id);
  }

  // Eliminar estadísticas
  static async delete(id: number): Promise<void> {
    const query = 'DELETE FROM goalkeeper_statistics WHERE id = ?';
    const [result] = await pool.query<ResultSetHeader>(query, [id]);

    if (result.affectedRows === 0) {
      throw new Error('Estadísticas no encontradas');
    }
  }

  // Obtener estadísticas agregadas de una temporada
  static async getSeasonStats(season: string) {
    const query = `
      SELECT 
        COUNT(DISTINCT gs.goalkeeper_id) as total_goalkeepers,
        SUM(gs.matches_played) as total_matches,
        SUM(gs.goals_conceded) as total_goals,
        SUM(gs.clean_sheets) as total_clean_sheets,
        SUM(gs.saves) as total_saves,
        ROUND(AVG(CASE 
          WHEN gs.matches_played > 0 
          THEN gs.goals_conceded / gs.matches_played 
          ELSE 0 
        END), 2) as avg_goals_per_match,
        ROUND(AVG(CASE 
          WHEN gs.matches_played > 0 
          THEN (gs.clean_sheets / gs.matches_played) * 100 
          ELSE 0 
        END), 2) as avg_clean_sheet_percentage
      FROM goalkeeper_statistics gs
      WHERE gs.season = ?
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [season]);
    return rows[0];
  }

  // Comparar porteros en una temporada
  static async compareGoalkeepers(goalkeeperIds: number[], season: string): Promise<ComparisonResult[]> {
    const placeholders = goalkeeperIds.map(() => '?').join(',');
    
    const query = `
      SELECT 
        gs.goalkeeper_id,
        CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name,
        gs.season,
        gs.matches_played,
        gs.goals_conceded,
        gs.clean_sheets,
        gs.saves,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND(gs.goals_conceded / gs.matches_played, 2)
          ELSE 0 
        END as goals_per_match,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND((gs.clean_sheets / gs.matches_played) * 100, 2)
          ELSE 0 
        END as clean_sheet_percentage,
        CASE 
          WHEN (gs.saves + gs.goals_conceded) > 0 
          THEN ROUND((gs.saves / (gs.saves + gs.goals_conceded)) * 100, 2)
          ELSE 0 
        END as save_percentage
      FROM goalkeeper_statistics gs
      INNER JOIN goalkeepers g ON gs.goalkeeper_id = g.id
      WHERE gs.goalkeeper_id IN (${placeholders})
        AND gs.season = ?
      ORDER BY gs.matches_played DESC
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [...goalkeeperIds, season]);
    return rows as ComparisonResult[];
  }

  // Obtener mejores porteros de la temporada
  static async getTopPerformers(season: string, limit: number = 10) {
    const query = `
      SELECT 
        gs.*,
        CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name,
        t.name as team_name,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND(gs.goals_conceded / gs.matches_played, 2)
          ELSE 0 
        END as goals_per_match,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND((gs.clean_sheets / gs.matches_played) * 100, 2)
          ELSE 0 
        END as clean_sheet_percentage,
        CASE 
          WHEN (gs.saves + gs.goals_conceded) > 0 
          THEN ROUND((gs.saves / (gs.saves + gs.goals_conceded)) * 100, 2)
          ELSE 0 
        END as save_percentage
      FROM goalkeeper_statistics gs
      INNER JOIN goalkeepers g ON gs.goalkeeper_id = g.id
      LEFT JOIN teams t ON g.team_id = t.id
      WHERE gs.season = ?
        AND gs.matches_played >= 5
      ORDER BY clean_sheet_percentage DESC, save_percentage DESC
      LIMIT ?
    `;

    const [rows] = await pool.query<GoalkeeperStatistics[]>(query, [season, limit]);
    return rows;
  }

  // Obtener todas las temporadas disponibles
  static async getAvailableSeasons(): Promise<string[]> {
    const query = `
      SELECT DISTINCT season
      FROM goalkeeper_statistics
      ORDER BY season DESC
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows.map(row => row.season);
  }

  // Verificar si existen estadísticas para un portero en una temporada
  static async exists(goalkeeperId: number, season: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM goalkeeper_statistics
      WHERE goalkeeper_id = ? AND season = ?
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [goalkeeperId, season]);
    return rows[0].count > 0;
  }
}
