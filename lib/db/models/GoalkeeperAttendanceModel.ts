import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface CreateAttendanceDTO {
  session_id: number;
  goalkeeper_id: number;
  status: 'present' | 'absent' | 'late' | 'injured' | 'excused';
  notes?: string;
}

export interface UpdateAttendanceDTO {
  status?: 'present' | 'absent' | 'late' | 'injured' | 'excused';
  notes?: string;
}

export interface GoalkeeperAttendance extends RowDataPacket {
  id: number;
  session_id: number;
  goalkeeper_id: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  goalkeeper_name?: string;
  goalkeeper_photo?: string;
  session_title?: string;
  session_date?: string;
}

export class GoalkeeperAttendanceModel {
  // Registrar asistencia
  static async create(data: CreateAttendanceDTO): Promise<GoalkeeperAttendance> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO goalkeeper_attendance 
       (session_id, goalkeeper_id, status, notes)
       VALUES (?, ?, ?, ?)`,
      [
        data.session_id,
        data.goalkeeper_id,
        data.status,
        data.notes || null
      ]
    );

    return this.findById(result.insertId);
  }

  // Obtener por ID
  static async findById(id: number): Promise<GoalkeeperAttendance> {
    const [rows] = await pool.execute<GoalkeeperAttendance[]>(
      `SELECT ga.*, 
       CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name,
       g.photo as goalkeeper_photo,
       ts.title as session_title,
       ts.session_date
       FROM goalkeeper_attendance ga
       LEFT JOIN goalkeepers g ON ga.goalkeeper_id = g.id
       LEFT JOIN training_sessions ts ON ga.session_id = ts.id
       WHERE ga.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Asistencia no encontrada');
    }

    return rows[0];
  }

  // Obtener asistencias por sesión
  static async findBySession(sessionId: number): Promise<GoalkeeperAttendance[]> {
    const [rows] = await pool.execute<GoalkeeperAttendance[]>(
      `SELECT ga.*, 
       CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name,
       g.photo as goalkeeper_photo,
       g.jersey_number
       FROM goalkeeper_attendance ga
       LEFT JOIN goalkeepers g ON ga.goalkeeper_id = g.id
       WHERE ga.session_id = ?
       ORDER BY g.last_name ASC, g.first_name ASC`,
      [sessionId]
    );

    return rows;
  }

  // Obtener asistencias por portero
  static async findByGoalkeeper(
    goalkeeperId: number,
    limit?: number
  ): Promise<GoalkeeperAttendance[]> {
    let query = `SELECT ga.*, 
       ts.title as session_title,
       ts.session_date,
       ts.session_type
       FROM goalkeeper_attendance ga
       LEFT JOIN training_sessions ts ON ga.session_id = ts.id
       WHERE ga.goalkeeper_id = ?
       ORDER BY ts.session_date DESC, ts.start_time DESC`;

    if (limit) {
      query += ` LIMIT ?`;
    }

    const params = limit ? [goalkeeperId, limit] : [goalkeeperId];

    const [rows] = await pool.execute<GoalkeeperAttendance[]>(query, params);
    return rows;
  }

  // Obtener asistencia específica de un portero en una sesión
  static async findBySessionAndGoalkeeper(
    sessionId: number,
    goalkeeperId: number
  ): Promise<GoalkeeperAttendance | null> {
    const [rows] = await pool.execute<GoalkeeperAttendance[]>(
      `SELECT ga.*, 
       CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name,
       ts.title as session_title
       FROM goalkeeper_attendance ga
       LEFT JOIN goalkeepers g ON ga.goalkeeper_id = g.id
       LEFT JOIN training_sessions ts ON ga.session_id = ts.id
       WHERE ga.session_id = ? AND ga.goalkeeper_id = ?`,
      [sessionId, goalkeeperId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  // Actualizar asistencia
  static async update(id: number, data: UpdateAttendanceDTO): Promise<GoalkeeperAttendance> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
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
      `UPDATE goalkeeper_attendance SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Eliminar asistencia
  static async delete(id: number): Promise<void> {
    await pool.execute('DELETE FROM goalkeeper_attendance WHERE id = ?', [id]);
  }

  // Obtener estadísticas de asistencia por portero
  static async getGoalkeeperStats(goalkeeperId: number): Promise<any> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN status = 'injured' THEN 1 ELSE 0 END) as injured_count,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_count,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_rate
      FROM goalkeeper_attendance
      WHERE goalkeeper_id = ?`,
      [goalkeeperId]
    );

    return rows[0];
  }

  // Obtener estadísticas de asistencia por sesión
  static async getSessionStats(sessionId: number): Promise<any> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_goalkeepers,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN status = 'injured' THEN 1 ELSE 0 END) as injured_count,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_count
      FROM goalkeeper_attendance
      WHERE session_id = ?`,
      [sessionId]
    );

    return rows[0];
  }

  // Registrar asistencia masiva (múltiples porteros)
  static async bulkCreate(attendances: CreateAttendanceDTO[]): Promise<void> {
    if (attendances.length === 0) return;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const attendance of attendances) {
        await connection.execute(
          `INSERT INTO goalkeeper_attendance 
           (session_id, goalkeeper_id, status, notes)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           status = VALUES(status),
           notes = VALUES(notes)`,
          [
            attendance.session_id,
            attendance.goalkeeper_id,
            attendance.status,
            attendance.notes || null
          ]
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

  // Obtener porteros sin asistencia registrada para una sesión
  static async getGoalkeepersWithoutAttendance(sessionId: number, teamId: number): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT g.id, g.first_name, g.last_name, g.jersey_number, g.photo
       FROM goalkeepers g
       WHERE g.team_id = ?
       AND g.id NOT IN (
         SELECT goalkeeper_id 
         FROM goalkeeper_attendance 
         WHERE session_id = ?
       )
       ORDER BY g.last_name ASC, g.first_name ASC`,
      [teamId, sessionId]
    );

    return rows;
  }
}
