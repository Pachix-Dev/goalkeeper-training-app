-- ================================================
-- GOALKEEPER TRAINING APP - DATABASE SCHEMA
-- ================================================
-- Version: 1.0
-- Database: MySQL 8.0+
-- Description: Base de datos completa para gestión de entrenamiento de porteros
-- ================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS goalkeeper_training
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE goalkeeper_training;

-- ================================================
-- TABLA: users (Usuarios del sistema)
-- ================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'coach', 'assistant') DEFAULT 'coach',
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: teams (Equipos)
-- ================================================
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  season VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#2563eb',
  user_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_season (season),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: goalkeepers (Porteros)
-- ================================================
CREATE TABLE IF NOT EXISTS goalkeepers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  nationality VARCHAR(100),
  photo VARCHAR(500),
  dominant_hand ENUM('left', 'right', 'both'),
  team_id INT,
  jersey_number INT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  INDEX idx_team_id (team_id),
  INDEX idx_full_name (last_name, first_name),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: tasks (Tareas/Ejercicios)
-- ================================================
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM(
    'technical', 
    'tactical', 
    'physical', 
    'psychological', 
    'goalkeeper_specific'
  ) NOT NULL,
  subcategory VARCHAR(100),
  duration INT COMMENT 'Duración en minutos',
  difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
  objectives TEXT,
  materials TEXT COMMENT 'Materiales necesarios',
  instructions TEXT,
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  user_id INT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_category (category),
  INDEX idx_difficulty (difficulty),
  INDEX idx_is_public (is_public),
  FULLTEXT idx_search (title, description, objectives)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: training_sessions (Sesiones de entrenamiento)
-- ================================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  session_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  session_type ENUM('training', 'match', 'recovery', 'tactical', 'physical') DEFAULT 'training',
  status ENUM('planned', 'completed', 'cancelled') DEFAULT 'planned',
  notes TEXT,
  weather VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_team_id (team_id),
  INDEX idx_user_id (user_id),
  INDEX idx_session_date (session_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: session_tasks (Tareas en sesiones)
-- ================================================
CREATE TABLE IF NOT EXISTS session_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  task_id INT NOT NULL,
  order_number INT NOT NULL,
  duration INT COMMENT 'Duración real en minutos',
  intensity ENUM('low', 'medium', 'high', 'very_high'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_session_id (session_id),
  INDEX idx_task_id (task_id),
  UNIQUE KEY unique_session_task_order (session_id, order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: training_designs (Disenos tacticos del editor)
-- ================================================
CREATE TABLE IF NOT EXISTS training_designs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  locale VARCHAR(10),
  data LONGTEXT NOT NULL COMMENT 'JSON serializado del editor',
  training_session_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (training_session_id) REFERENCES training_sessions(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_training_session_id (training_session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: goalkeeper_attendance (Asistencia de porteros)
-- ================================================
CREATE TABLE IF NOT EXISTS goalkeeper_attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  goalkeeper_id INT NOT NULL,
  status ENUM('present', 'absent', 'late', 'injured', 'excused') DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers(id) ON DELETE CASCADE,
  INDEX idx_session_id (session_id),
  INDEX idx_goalkeeper_id (goalkeeper_id),
  UNIQUE KEY unique_session_goalkeeper (session_id, goalkeeper_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: penalties (Scouting de penaltis)
-- ================================================
CREATE TABLE IF NOT EXISTS penalties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goalkeeper_id INT NOT NULL,
  opponent_name VARCHAR(255) NOT NULL,
  match_date DATE,
  competition VARCHAR(255),
  penalty_taker VARCHAR(255) NOT NULL,
  taker_foot ENUM('left', 'right'),
  shot_direction ENUM('left', 'center', 'right') NOT NULL,
  shot_height ENUM('low', 'mid', 'high') NOT NULL,
  result ENUM('saved', 'goal', 'missed', 'post') NOT NULL,
  goalkeeper_direction ENUM('left', 'center', 'right', 'stayed'),
  notes TEXT,
  video_url VARCHAR(500),
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_goalkeeper_id (goalkeeper_id),
  INDEX idx_match_date (match_date),
  INDEX idx_result (result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: match_analysis (Análisis de partidos)
-- ================================================
CREATE TABLE IF NOT EXISTS match_analysis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goalkeeper_id INT NOT NULL,
  match_date DATE NOT NULL,
  opponent VARCHAR(255) NOT NULL,
  competition VARCHAR(255),
  result VARCHAR(50),
  minutes_played INT,
  goals_conceded INT DEFAULT 0,
  saves INT DEFAULT 0,
  high_balls INT DEFAULT 0,
  crosses_caught INT DEFAULT 0,
  distribution_success_rate DECIMAL(5,2),
  rating DECIMAL(3,1),
  strengths TEXT,
  areas_for_improvement TEXT,
  notes TEXT,
  video_url VARCHAR(500),
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_goalkeeper_id (goalkeeper_id),
  INDEX idx_match_date (match_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: goalkeeper_statistics (Estadísticas de porteros)
-- ================================================
CREATE TABLE IF NOT EXISTS goalkeeper_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goalkeeper_id INT NOT NULL,
  season VARCHAR(50) NOT NULL,
  matches_played INT DEFAULT 0,
  minutes_played INT DEFAULT 0,
  goals_conceded INT DEFAULT 0,
  clean_sheets INT DEFAULT 0,
  saves INT DEFAULT 0,
  penalties_saved INT DEFAULT 0,
  penalties_faced INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers(id) ON DELETE CASCADE,
  INDEX idx_goalkeeper_id (goalkeeper_id),
  INDEX idx_season (season),
  UNIQUE KEY unique_goalkeeper_season (goalkeeper_id, season)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: methodology_settings (Configuración de metodología)
-- ================================================
CREATE TABLE IF NOT EXISTS methodology_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  UNIQUE KEY unique_user_setting (user_id, setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: refresh_tokens (Tokens de sesión)
-- ================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- INSERTAR DATOS DE EJEMPLO (OPCIONAL)
-- ================================================

-- Usuario admin por defecto (password: Admin123!)
-- Hash generado con bcrypt
INSERT INTO users (email, password_hash, name, role, is_active, email_verified) VALUES
('admin@goalkeeper.com', '$2a$10$X9rQqE5ZGXiJ6YqGYKp5.OLkYvX8fqKQMJYQPZUKY7RYnVBZqJZYS', 'Administrador', 'admin', TRUE, TRUE),
('coach@goalkeeper.com', '$2a$10$X9rQqE5ZGXiJ6YqGYKp5.OLkYvX8fqKQMJYQPZUKY7RYnVBZqJZYS', 'Coach Demo', 'coach', TRUE, TRUE);

-- ================================================
-- VISTAS ÚTILES
-- ================================================

-- Vista: Resumen de equipos con contador de porteros
CREATE OR REPLACE VIEW vw_teams_summary AS
SELECT 
  t.id,
  t.name,
  t.category,
  t.season,
  t.color,
  t.is_active,
  COUNT(g.id) as total_goalkeepers,
  u.name as coach_name
FROM teams t
LEFT JOIN goalkeepers g ON t.id = g.team_id AND g.is_active = TRUE
LEFT JOIN users u ON t.user_id = u.id
WHERE t.is_active = TRUE
GROUP BY t.id, t.name, t.category, t.season, t.color, t.is_active, u.name;

-- Vista: Estadísticas de sesiones por equipo
CREATE OR REPLACE VIEW vw_team_sessions_stats AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  COUNT(ts.id) as total_sessions,
  SUM(CASE WHEN ts.status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
  SUM(CASE WHEN ts.status = 'planned' THEN 1 ELSE 0 END) as planned_sessions,
  SUM(CASE WHEN ts.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_sessions
FROM teams t
LEFT JOIN training_sessions ts ON t.id = ts.team_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.name;

-- Vista: Rendimiento de porteros en penaltis
CREATE OR REPLACE VIEW vw_goalkeeper_penalty_stats AS
SELECT 
  g.id as goalkeeper_id,
  CONCAT(g.first_name, ' ', g.last_name) as goalkeeper_name,
  COUNT(p.id) as total_penalties,
  SUM(CASE WHEN p.result = 'saved' THEN 1 ELSE 0 END) as saved,
  SUM(CASE WHEN p.result = 'goal' THEN 1 ELSE 0 END) as conceded,
  SUM(CASE WHEN p.result = 'missed' THEN 1 ELSE 0 END) as missed,
  SUM(CASE WHEN p.result = 'post' THEN 1 ELSE 0 END) as post,
  ROUND(SUM(CASE WHEN p.result = 'saved' THEN 1 ELSE 0 END) * 100.0 / 
    NULLIF(COUNT(p.id), 0), 2) as save_percentage
FROM goalkeepers g
LEFT JOIN penalties p ON g.id = p.goalkeeper_id
WHERE g.is_active = TRUE
GROUP BY g.id, goalkeeper_name;

-- ================================================
-- PROCEDIMIENTOS ALMACENADOS
-- ================================================

DELIMITER //

-- Procedimiento: Actualizar estadísticas de portero
CREATE PROCEDURE sp_update_goalkeeper_stats(
  IN p_goalkeeper_id INT,
  IN p_season VARCHAR(50)
)
BEGIN
  DECLARE v_matches INT;
  DECLARE v_goals INT;
  DECLARE v_saves INT;
  
  -- Contar partidos
  SELECT COUNT(*) INTO v_matches
  FROM match_analysis
  WHERE goalkeeper_id = p_goalkeeper_id;
  
  -- Sumar goles concedidos
  SELECT COALESCE(SUM(goals_conceded), 0) INTO v_goals
  FROM match_analysis
  WHERE goalkeeper_id = p_goalkeeper_id;
  
  -- Sumar paradas
  SELECT COALESCE(SUM(saves), 0) INTO v_saves
  FROM match_analysis
  WHERE goalkeeper_id = p_goalkeeper_id;
  
  -- Actualizar o insertar estadísticas
  INSERT INTO goalkeeper_statistics 
    (goalkeeper_id, season, matches_played, goals_conceded, saves)
  VALUES 
    (p_goalkeeper_id, p_season, v_matches, v_goals, v_saves)
  ON DUPLICATE KEY UPDATE
    matches_played = v_matches,
    goals_conceded = v_goals,
    saves = v_saves,
    updated_at = CURRENT_TIMESTAMP;
END //

DELIMITER ;

-- ================================================
-- TRIGGERS
-- ================================================

-- Trigger: Limpiar tokens expirados al insertar uno nuevo
DELIMITER //
CREATE TRIGGER before_insert_refresh_token
BEFORE INSERT ON refresh_tokens
FOR EACH ROW
BEGIN
  DELETE FROM refresh_tokens 
  WHERE expires_at < NOW();
END //
DELIMITER ;

-- ================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ================================================

-- Índice compuesto para búsquedas de sesiones
CREATE INDEX idx_session_team_date ON training_sessions(team_id, session_date, status);

-- Índice para búsquedas de porteros por equipo
CREATE INDEX idx_goalkeeper_team_active ON goalkeepers(team_id, is_active);

-- ================================================
-- FIN DEL SCRIPT
-- ================================================
