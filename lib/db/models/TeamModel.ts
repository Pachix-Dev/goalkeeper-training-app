import { query } from '../connection';
import { Team, CreateTeamDTO, UpdateTeamDTO, TeamWithStats } from '@/lib/types/database';

export class TeamModel {
  // Crear equipo
  static async create(userId: number, data: CreateTeamDTO): Promise<Team> {
    const sql = `
      INSERT INTO teams (name, category, season, description, color, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result: any = await query(sql, [
      data.name,
      data.category,
      data.season,
      data.description || null,
      data.color || '#2563eb',
      userId
    ]);
    
    return this.findById(result.insertId);
  }

  // Buscar por ID
  static async findById(id: number): Promise<Team | null> {
    const sql = 'SELECT * FROM teams WHERE id = ? AND is_active = TRUE';
    const results: Team[] = await query(sql, [id]);
    return results[0] || null;
  }

  // Buscar por usuario
  static async findByUser(userId: number): Promise<Team[]> {
    const sql = `
      SELECT * FROM teams 
      WHERE user_id = ? AND is_active = TRUE 
      ORDER BY season DESC, name ASC
    `;
    return query<Team[]>(sql, [userId]);
  }

  // Buscar con estadísticas
  static async findWithStats(userId: number): Promise<TeamWithStats[]> {
    const sql = `
      SELECT * FROM vw_teams_summary
      WHERE coach_name = (SELECT name FROM users WHERE id = ?)
      ORDER BY season DESC, name ASC
    `;
    return query<TeamWithStats[]>(sql, [userId]);
  }

  // Actualizar equipo
  static async update(id: number, data: UpdateTeamDTO): Promise<Team> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.category) {
      fields.push('category = ?');
      values.push(data.category);
    }
    if (data.season) {
      fields.push('season = ?');
      values.push(data.season);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.color) {
      fields.push('color = ?');
      values.push(data.color);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active);
    }

    values.push(id);

    const sql = `UPDATE teams SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);

    return this.findById(id);
  }

  // Eliminar equipo (soft delete)
  static async delete(id: number): Promise<void> {
    const sql = 'UPDATE teams SET is_active = FALSE WHERE id = ?';
    await query(sql, [id]);
  }

  // Contar equipos por usuario
  static async countByUser(userId: number): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM teams WHERE user_id = ? AND is_active = TRUE';
    const result: any = await query(sql, [userId]);
    return result[0].count;
  }

  // Buscar por temporada
  static async findBySeason(userId: number, season: string): Promise<Team[]> {
    const sql = `
      SELECT * FROM teams 
      WHERE user_id = ? AND season = ? AND is_active = TRUE 
      ORDER BY name ASC
    `;
    return query<Team[]>(sql, [userId, season]);
  }
}
