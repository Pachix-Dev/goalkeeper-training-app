import { query } from '../connection';
import { CreateTrainingDesignDTO, TrainingDesign, UpdateTrainingDesignDTO } from '../../types/database';

export class TrainingDesignModel {
  static async create(userId: number, dto: CreateTrainingDesignDTO): Promise<TrainingDesign> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO training_designs (user_id, title, locale, data, training_session_id) VALUES (?, ?, ?, ?, ?)`,
      [userId, dto.title, dto.locale || null, JSON.stringify(dto.data), dto.training_session_id ?? null]
    );
    const insertedId = result.insertId;
    return this.findById(insertedId);
  }

  static async findById(id: number): Promise<TrainingDesign> {
    const rows = await query<TrainingDesign & { data: string }>(
      `SELECT id, user_id, title, locale, data, training_session_id, created_at, updated_at FROM training_designs WHERE id = ?`,
      [id]
    );
    if (!rows[0]) throw new Error('Design not found');
    const row = rows[0];
    return { ...row, data: safeParse(row.data) } as TrainingDesign;
  }

  static async listByUser(userId: number, limit = 50): Promise<TrainingDesign[]> {
    const rows = await query<(TrainingDesign & { data: string })[]>(
      `SELECT id, user_id, title, locale, data, training_session_id, created_at, updated_at
       FROM training_designs WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?`,
      [userId, limit]
    );
    return rows.map(r => ({ ...r, data: safeParse(r.data) }));
  }

  static async update(id: number, userId: number, dto: UpdateTrainingDesignDTO): Promise<TrainingDesign> {
    const current = await this.findById(id);
    if (current.user_id !== userId) throw new Error('Forbidden');
    await query(
      `UPDATE training_designs SET title = COALESCE(?, title), data = COALESCE(?, data), training_session_id = COALESCE(?, training_session_id), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [dto.title ?? null, dto.data ? JSON.stringify(dto.data) : null, dto.training_session_id !== undefined ? dto.training_session_id : null, id]
    );
    return this.findById(id);
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const current = await this.findById(id);
    if (current.user_id !== userId) throw new Error('Forbidden');
    await query(`DELETE FROM training_designs WHERE id = ?`, [id]);
    return true;
  }
}

function safeParse(str: string) {
  try { return JSON.parse(str); } catch { return {}; }
}
