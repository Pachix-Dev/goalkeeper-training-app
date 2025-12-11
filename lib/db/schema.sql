-- ================================================
-- GOALKEEPER TRAINING APP - DATABASE SCHEMA
-- ================================================
-- Version: 2.0
-- Database: MySQL 8.0+ / MariaDB 10.4+
-- Last Updated: 2025-12-11
-- Description: Base de datos completa para gestión de entrenamiento de porteros
-- ================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS goalkeeper_training
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE goalkeeper_training;

-- ================================================
-- TABLA: users
-- ================================================
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin','coach','assistant') DEFAULT 'coach',
  avatar VARCHAR(500) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  email_verified TINYINT(1) DEFAULT 0,
  last_login TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  KEY idx_email (email),
  KEY idx_role (role),
  KEY idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: teams
-- ================================================
CREATE TABLE IF NOT EXISTS teams (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  season VARCHAR(50) NOT NULL,
  description TEXT DEFAULT NULL,
  color VARCHAR(7) DEFAULT '#2563eb',
  user_id INT NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_season (season),
  KEY idx_is_active (is_active),
  CONSTRAINT teams_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: goalkeepers
-- ================================================
CREATE TABLE IF NOT EXISTS goalkeepers (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE DEFAULT NULL,
  height DECIMAL(5,2) DEFAULT NULL,
  weight DECIMAL(5,2) DEFAULT NULL,
  nationality VARCHAR(100) DEFAULT NULL,
  photo VARCHAR(500) DEFAULT NULL,
  dominant_hand ENUM('left','right','both') DEFAULT NULL,
  team_id INT DEFAULT NULL,
  jersey_number INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_team_id (team_id),
  KEY idx_full_name (last_name,first_name),
  KEY idx_is_active (is_active),
  KEY idx_goalkeeper_team_active (team_id,is_active),
  CONSTRAINT goalkeepers_ibfk_1 FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: tasks
-- ================================================
CREATE TABLE IF NOT EXISTS tasks (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  category ENUM('technical','tactical','physical','psychological','goalkeeper_specific') NOT NULL,
  subcategory VARCHAR(100) DEFAULT NULL,
  duration INT DEFAULT NULL COMMENT 'Duración en minutos',
  difficulty ENUM('beginner','intermediate','advanced') DEFAULT 'intermediate',
  objectives TEXT DEFAULT NULL,
  materials TEXT DEFAULT NULL COMMENT 'Materiales necesarios',
  instructions TEXT DEFAULT NULL,
  video_url VARCHAR(500) DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  user_id INT NOT NULL,
  is_public TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_category (category),
  KEY idx_difficulty (difficulty),
  KEY idx_is_public (is_public),
  FULLTEXT KEY idx_search (title,description,objectives),
  CONSTRAINT tasks_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: training_sessions
-- ================================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  session_date DATE NOT NULL,
  start_time TIME DEFAULT NULL,
  end_time TIME DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  session_type ENUM('training','match','recovery','tactical','physical') DEFAULT 'training',
  status ENUM('planned','completed','cancelled') DEFAULT 'planned',
  notes TEXT DEFAULT NULL,
  weather VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_team_id (team_id),
  KEY idx_user_id (user_id),
  KEY idx_session_date (session_date),
  KEY idx_status (status),
  KEY idx_session_team_date (team_id,session_date,status),
  CONSTRAINT training_sessions_ibfk_1 FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
  CONSTRAINT training_sessions_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: session_tasks
-- ================================================
CREATE TABLE IF NOT EXISTS session_tasks (
  id INT NOT NULL AUTO_INCREMENT,
  session_id INT NOT NULL,
  task_id INT NOT NULL,
  order_number INT NOT NULL,
  duration INT DEFAULT NULL COMMENT 'Duración real en minutos',
  intensity ENUM('low','medium','high','very_high') DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_session_task_order (session_id,order_number),
  KEY idx_session_id (session_id),
  KEY idx_task_id (task_id),
  CONSTRAINT session_tasks_ibfk_1 FOREIGN KEY (session_id) REFERENCES training_sessions (id) ON DELETE CASCADE,
  CONSTRAINT session_tasks_ibfk_2 FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: training_designs
-- ================================================
CREATE TABLE IF NOT EXISTS training_designs (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  locale VARCHAR(10) DEFAULT NULL,
  data LONGTEXT NOT NULL COMMENT 'JSON serializado del editor',
  training_session_id INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_training_session_id (training_session_id),
  CONSTRAINT training_designs_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT training_designs_ibfk_2 FOREIGN KEY (training_session_id) REFERENCES training_sessions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: goalkeeper_attendance
-- ================================================
CREATE TABLE IF NOT EXISTS goalkeeper_attendance (
  id INT NOT NULL AUTO_INCREMENT,
  session_id INT NOT NULL,
  goalkeeper_id INT NOT NULL,
  status ENUM('present','absent','late','injured','excused') DEFAULT 'present',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_session_goalkeeper (session_id,goalkeeper_id),
  KEY idx_session_id (session_id),
  KEY idx_goalkeeper_id (goalkeeper_id),
  CONSTRAINT goalkeeper_attendance_ibfk_1 FOREIGN KEY (session_id) REFERENCES training_sessions (id) ON DELETE CASCADE,
  CONSTRAINT goalkeeper_attendance_ibfk_2 FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: penalties
-- ================================================
CREATE TABLE IF NOT EXISTS penalties (
  id INT NOT NULL AUTO_INCREMENT,
  goalkeeper_id INT NOT NULL,
  opponent_name VARCHAR(255) NOT NULL,
  match_date DATE DEFAULT NULL,
  competition VARCHAR(255) DEFAULT NULL,
  penalty_taker VARCHAR(255) NOT NULL,
  taker_foot ENUM('left','right') DEFAULT NULL,
  shot_direction ENUM('left','center','right') NOT NULL,
  shot_height ENUM('low','mid','high') NOT NULL,
  result ENUM('saved','goal','missed','post') NOT NULL,
  goalkeeper_direction ENUM('left','center','right','stayed') DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  video_url VARCHAR(500) DEFAULT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY created_by (created_by),
  KEY idx_goalkeeper_id (goalkeeper_id),
  KEY idx_match_date (match_date),
  KEY idx_result (result),
  CONSTRAINT penalties_ibfk_1 FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers (id) ON DELETE CASCADE,
  CONSTRAINT penalties_ibfk_2 FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: match_analysis
-- ================================================
CREATE TABLE IF NOT EXISTS match_analysis (
  id INT NOT NULL AUTO_INCREMENT,
  goalkeeper_id INT NOT NULL,
  match_date DATE NOT NULL,
  opponent VARCHAR(255) NOT NULL,
  competition VARCHAR(255) DEFAULT NULL,
  result VARCHAR(50) DEFAULT NULL,
  minutes_played INT DEFAULT NULL,
  goals_conceded INT DEFAULT 0,
  saves INT DEFAULT 0,
  high_balls INT DEFAULT 0,
  crosses_caught INT DEFAULT 0,
  distribution_success_rate DECIMAL(5,2) DEFAULT NULL,
  rating DECIMAL(3,1) DEFAULT NULL,
  strengths TEXT DEFAULT NULL,
  areas_for_improvement TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  video_url VARCHAR(500) DEFAULT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY created_by (created_by),
  KEY idx_goalkeeper_id (goalkeeper_id),
  KEY idx_match_date (match_date),
  CONSTRAINT match_analysis_ibfk_1 FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers (id) ON DELETE CASCADE,
  CONSTRAINT match_analysis_ibfk_2 FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: goalkeeper_statistics
-- ================================================
CREATE TABLE IF NOT EXISTS goalkeeper_statistics (
  id INT NOT NULL AUTO_INCREMENT,
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_goalkeeper_season (goalkeeper_id,season),
  KEY idx_goalkeeper_id (goalkeeper_id),
  KEY idx_season (season),
  CONSTRAINT goalkeeper_statistics_ibfk_1 FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: methodology_settings
-- ================================================
CREATE TABLE IF NOT EXISTS methodology_settings (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT DEFAULT NULL,
  setting_type ENUM('text','number','boolean','json') DEFAULT 'text',
  category VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_setting (user_id,setting_key),
  KEY idx_user_id (user_id),
  CONSTRAINT methodology_settings_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: refresh_tokens
-- ================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY token (token),
  KEY idx_user_id (user_id),
  KEY idx_token (token),
  KEY idx_expires_at (expires_at),
  CONSTRAINT refresh_tokens_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TRIGGER: Limpiar tokens expirados
-- ================================================
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
-- VISTAS
-- ================================================

-- Vista: Estadísticas de penaltis por portero
CREATE OR REPLACE VIEW vw_goalkeeper_penalty_stats AS
SELECT 
  g.id AS goalkeeper_id,
  CONCAT(g.first_name,' ',g.last_name) AS goalkeeper_name,
  COUNT(p.id) AS total_penalties,
  SUM(CASE WHEN p.result = 'saved' THEN 1 ELSE 0 END) AS saved,
  SUM(CASE WHEN p.result = 'goal' THEN 1 ELSE 0 END) AS conceded,
  SUM(CASE WHEN p.result = 'missed' THEN 1 ELSE 0 END) AS missed,
  SUM(CASE WHEN p.result = 'post' THEN 1 ELSE 0 END) AS post,
  ROUND(SUM(CASE WHEN p.result = 'saved' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(p.id),0),2) AS save_percentage
FROM goalkeepers g
LEFT JOIN penalties p ON g.id = p.goalkeeper_id
WHERE g.is_active = 1
GROUP BY g.id, CONCAT(g.first_name,' ',g.last_name);

-- Vista: Resumen de equipos
CREATE OR REPLACE VIEW vw_teams_summary AS
SELECT 
  t.id,
  t.name,
  t.category,
  t.season,
  t.color,
  t.is_active,
  COUNT(g.id) AS total_goalkeepers,
  u.name AS coach_name
FROM teams t
LEFT JOIN goalkeepers g ON t.id = g.team_id AND g.is_active = 1
LEFT JOIN users u ON t.user_id = u.id
WHERE t.is_active = 1
GROUP BY t.id, t.name, t.category, t.season, t.color, t.is_active, u.name;

-- Vista: Estadísticas de sesiones por equipo
CREATE OR REPLACE VIEW vw_team_sessions_stats AS
SELECT 
  t.id AS team_id,
  t.name AS team_name,
  COUNT(ts.id) AS total_sessions,
  SUM(CASE WHEN ts.status = 'completed' THEN 1 ELSE 0 END) AS completed_sessions,
  SUM(CASE WHEN ts.status = 'planned' THEN 1 ELSE 0 END) AS planned_sessions,
  SUM(CASE WHEN ts.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_sessions
FROM teams t
LEFT JOIN training_sessions ts ON t.id = ts.team_id
WHERE t.is_active = 1
GROUP BY t.id, t.name;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
