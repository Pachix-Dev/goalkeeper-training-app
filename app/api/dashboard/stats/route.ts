import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthUser } from '@/lib/auth/middleware';
import pool from '@/lib/db/connection';
import { RowDataPacket } from 'mysql2';

// GET /api/dashboard/stats - Obtener estadísticas generales del dashboard
export const GET = requireAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    // Totales generales
    const [teamsResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM teams WHERE user_id = ? AND is_active = 1',
      [user.id]
    );

    const [goalkeepersResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM goalkeepers WHERE team_id IN (SELECT id FROM teams WHERE user_id = ?) AND is_active = 1',
      [user.id]
    );

    const [tasksResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM tasks WHERE user_id = ? OR is_public = 1',
      [user.id]
    );

    const [sessionsResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM training_sessions WHERE user_id = ?',
      [user.id]
    );

    // Próximas sesiones (próximos 7 días)
    const [upcomingSessionsResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ts.*,
        t.name as team_name
      FROM training_sessions ts
      LEFT JOIN teams t ON ts.team_id = t.id
      WHERE ts.user_id = ?
        AND ts.session_date >= CURDATE()
        AND ts.session_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND ts.status != 'cancelled'
      ORDER BY ts.session_date ASC, ts.start_time ASC
      LIMIT 5`,
      [user.id]
    );

    // Sesiones recientes (últimas 5 completadas)
    const [recentSessionsResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ts.*,
        t.name as team_name
      FROM training_sessions ts
      LEFT JOIN teams t ON ts.team_id = t.id
      WHERE ts.user_id = ?
        AND ts.status = 'completed'
      ORDER BY ts.session_date DESC, ts.start_time DESC
      LIMIT 5`,
      [user.id]
    );

    // Análisis de partidos recientes
    const [recentMatchesResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ma.*,
        CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name
      FROM match_analysis ma
      INNER JOIN goalkeepers g ON ma.goalkeeper_id = g.id
      INNER JOIN teams t ON g.team_id = t.id
      WHERE t.user_id = ?
      ORDER BY ma.match_date DESC
      LIMIT 5`,
      [user.id]
    );

    // Estadísticas de penaltis
    const [penaltiesResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN result = 'saved' THEN 1 ELSE 0 END) as saved,
        SUM(CASE WHEN result = 'goal' THEN 1 ELSE 0 END) as goals
      FROM penalties p
      INNER JOIN goalkeepers g ON p.goalkeeper_id = g.id
      INNER JOIN teams t ON g.team_id = t.id
      WHERE t.user_id = ?`,
      [user.id]
    );

    // Top porteros por porcentaje de portería a cero (temporada actual)
    const currentSeason = new Date().getFullYear().toString();
    const [topGoalkeepersResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
        gs.*,
        CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name,
        t.name as team_name,
        CASE 
          WHEN gs.matches_played > 0 
          THEN ROUND((gs.clean_sheets / gs.matches_played) * 100, 2)
          ELSE 0 
        END as clean_sheet_percentage
      FROM goalkeeper_statistics gs
      INNER JOIN goalkeepers g ON gs.goalkeeper_id = g.id
      LEFT JOIN teams t ON g.team_id = t.id
      WHERE gs.season = ?
        AND g.team_id IN (SELECT id FROM teams WHERE user_id = ?)
        AND gs.matches_played >= 3
      ORDER BY clean_sheet_percentage DESC
      LIMIT 5`,
      [currentSeason, user.id]
    );

    // Estadísticas de asistencia
    const [attendanceResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ga.status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN ga.status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN ga.status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN ga.status = 'injured' THEN 1 ELSE 0 END) as injured
      FROM goalkeeper_attendance ga
      INNER JOIN training_sessions ts ON ga.session_id = ts.id
      WHERE ts.user_id = ?
        AND ts.session_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [user.id]
    );

    const stats = {
      totals: {
        teams: teamsResult[0].total,
        goalkeepers: goalkeepersResult[0].total,
        tasks: tasksResult[0].total,
        sessions: sessionsResult[0].total
      },
      upcomingSessions: upcomingSessionsResult,
      recentSessions: recentSessionsResult,
      recentMatches: recentMatchesResult,
      penalties: penaltiesResult[0],
      topGoalkeepers: topGoalkeepersResult,
      attendance: attendanceResult[0]
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del dashboard' },
      { status: 500 }
    );
  }
});
