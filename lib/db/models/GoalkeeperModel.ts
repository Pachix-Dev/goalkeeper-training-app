import { query } from '../connection';
import { 
  Goalkeeper, 
  CreateGoalkeeperDTO, 
  UpdateGoalkeeperDTO,
  GoalkeeperWithTeam 
} from '@/lib/types/database';

export class GoalkeeperModel {
  // Crear portero
  static async create(data: CreateGoalkeeperDTO): Promise<Goalkeeper> {
    const sql = `
      INSERT INTO goalkeepers 
      (first_name, last_name, date_of_birth, height, weight, nationality, 
       photo, dominant_hand, team_id, jersey_number, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result: any = await query(sql, [
      data.first_name,
      data.last_name,
      data.date_of_birth || null,
      data.height || null,
      data.weight || null,
      data.nationality || null,
      data.photo || null,
      data.dominant_hand || null,
      data.team_id || null,
      data.jersey_number || null,
      data.notes || null
    ]);
    
    return this.findById(result.insertId);
  }

  // Buscar por ID
  static async findById(id: number): Promise<Goalkeeper | null> {
    const sql = 'SELECT * FROM goalkeepers WHERE id = ? AND is_active = TRUE';
    const results: Goalkeeper[] = await query(sql, [id]);
    return results[0] || null;
  }

  // Buscar con información de equipo
  static async findByIdWithTeam(id: number): Promise<GoalkeeperWithTeam | null> {
    const sql = `
      SELECT 
        g.*,
        t.name as team_name,
        t.category as team_category
      FROM goalkeepers g
      LEFT JOIN teams t ON g.team_id = t.id
      WHERE g.id = ? AND g.is_active = TRUE
    `;
    const results: GoalkeeperWithTeam[] = await query(sql, [id]);
    return results[0] || null;
  }

  // Buscar por equipo
  static async findByTeam(teamId: number): Promise<Goalkeeper[]> {
    const sql = `
      SELECT * FROM goalkeepers 
      WHERE team_id = ? AND is_active = TRUE 
      ORDER BY last_name, first_name
    `;
    return query<Goalkeeper[]>(sql, [teamId]);
  }

  // Buscar todos los porteros activos del coach
  static async findByCoach(userId: number): Promise<GoalkeeperWithTeam[]> {
    const sql = `
      SELECT 
        g.*,
        t.name as team_name,
        t.category as team_category
      FROM goalkeepers g
      LEFT JOIN teams t ON g.team_id = t.id
      WHERE t.user_id = ? AND g.is_active = TRUE
      ORDER BY g.last_name, g.first_name
    `;
    return query<GoalkeeperWithTeam[]>(sql, [userId]);
  }

  // Actualizar portero
  static async update(id: number, data: UpdateGoalkeeperDTO): Promise<Goalkeeper> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.first_name) {
      fields.push('first_name = ?');
      values.push(data.first_name);
    }
    if (data.last_name) {
      fields.push('last_name = ?');
      values.push(data.last_name);
    }
    if (data.date_of_birth !== undefined) {
      fields.push('date_of_birth = ?');
      values.push(data.date_of_birth);
    }
    if (data.height !== undefined) {
      fields.push('height = ?');
      values.push(data.height);
    }
    if (data.weight !== undefined) {
      fields.push('weight = ?');
      values.push(data.weight);
    }
    if (data.nationality !== undefined) {
      fields.push('nationality = ?');
      values.push(data.nationality);
    }
    if (data.photo !== undefined) {
      fields.push('photo = ?');
      values.push(data.photo);
    }
    if (data.dominant_hand !== undefined) {
      fields.push('dominant_hand = ?');
      values.push(data.dominant_hand);
    }
    if (data.team_id !== undefined) {
      fields.push('team_id = ?');
      values.push(data.team_id);
    }
    if (data.jersey_number !== undefined) {
      fields.push('jersey_number = ?');
      values.push(data.jersey_number);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active);
    }

    values.push(id);

    const sql = `UPDATE goalkeepers SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);

    return this.findById(id);
  }

  // Eliminar portero (soft delete)
  static async delete(id: number): Promise<void> {
    const sql = 'UPDATE goalkeepers SET is_active = FALSE WHERE id = ?';
    await query(sql, [id]);
  }

  // Contar porteros por equipo
  static async countByTeam(teamId: number): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM goalkeepers WHERE team_id = ? AND is_active = TRUE';
    const result: any = await query(sql, [teamId]);
    return result[0].count;
  }

  // Contar todos los porteros del coach
  static async countByCoach(userId: number): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count 
      FROM goalkeepers g
      INNER JOIN teams t ON g.team_id = t.id
      WHERE t.user_id = ? AND g.is_active = TRUE
    `;
    const result: any = await query(sql, [userId]);
    return result[0].count;
  }

  // Buscar por nombre
  static async search(userId: number, searchTerm: string): Promise<GoalkeeperWithTeam[]> {
    const sql = `
      SELECT 
        g.*,
        t.name as team_name,
        t.category as team_category
      FROM goalkeepers g
      LEFT JOIN teams t ON g.team_id = t.id
      WHERE t.user_id = ? 
        AND g.is_active = TRUE
        AND (g.first_name LIKE ? OR g.last_name LIKE ?)
      ORDER BY g.last_name, g.first_name
    `;
    const searchPattern = `%${searchTerm}%`;
    return query<GoalkeeperWithTeam[]>(sql, [userId, searchPattern, searchPattern]);
  }
}
