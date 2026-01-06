-- ================================================
-- GOALKEEPER TRAINING APP - SUBSCRIPTIONS MIGRATION
-- ================================================
-- Version: 3.0
-- Description: Sistema de suscripciones con Stripe
-- ================================================

USE goalkeeper_training;

-- ================================================
-- TABLA: subscription_plans
-- ================================================
-- Almacena los planes de suscripción disponibles
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT DEFAULT NULL,
  stripe_product_id VARCHAR(255) DEFAULT NULL,
  stripe_price_id_monthly VARCHAR(255) DEFAULT NULL,
  stripe_price_id_yearly VARCHAR(255) DEFAULT NULL,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  features JSON DEFAULT NULL,
  max_teams INT DEFAULT 1,
  max_goalkeepers INT DEFAULT 3,
  max_tasks INT DEFAULT 5,
  max_sessions_per_month INT DEFAULT 10,
  has_tactical_editor TINYINT(1) DEFAULT 0,
  has_statistics TINYINT(1) DEFAULT 0,
  has_match_analysis TINYINT(1) DEFAULT 0,
  has_penalty_tracking TINYINT(1) DEFAULT 0,
  has_export_pdf TINYINT(1) DEFAULT 0,
  has_priority_support TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_popular TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_slug (slug),
  KEY idx_is_active (is_active),
  KEY idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: user_subscriptions
-- ================================================
-- Almacena las suscripciones activas de cada usuario
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  stripe_customer_id VARCHAR(255) DEFAULT NULL,
  stripe_subscription_id VARCHAR(255) DEFAULT NULL,
  status ENUM('active','cancelled','past_due','trialing','incomplete','incomplete_expired','paused','unpaid') DEFAULT 'active',
  billing_cycle ENUM('monthly','yearly','lifetime') DEFAULT 'monthly',
  current_period_start TIMESTAMP NULL DEFAULT NULL,
  current_period_end TIMESTAMP NULL DEFAULT NULL,
  trial_start TIMESTAMP NULL DEFAULT NULL,
  trial_end TIMESTAMP NULL DEFAULT NULL,
  cancel_at_period_end TINYINT(1) DEFAULT 0,
  cancelled_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_subscription (user_id),
  KEY idx_stripe_customer (stripe_customer_id),
  KEY idx_stripe_subscription (stripe_subscription_id),
  KEY idx_status (status),
  KEY idx_plan_id (plan_id),
  KEY idx_current_period_end (current_period_end),
  CONSTRAINT user_subscriptions_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT user_subscriptions_ibfk_2 FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: subscription_invoices
-- ================================================
-- Historial de facturas/pagos
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  subscription_id INT DEFAULT NULL,
  stripe_invoice_id VARCHAR(255) NOT NULL,
  stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('draft','open','paid','void','uncollectible') DEFAULT 'open',
  billing_reason VARCHAR(100) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  invoice_url VARCHAR(500) DEFAULT NULL,
  invoice_pdf VARCHAR(500) DEFAULT NULL,
  hosted_invoice_url VARCHAR(500) DEFAULT NULL,
  period_start TIMESTAMP NULL DEFAULT NULL,
  period_end TIMESTAMP NULL DEFAULT NULL,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_stripe_invoice (stripe_invoice_id),
  KEY idx_user_id (user_id),
  KEY idx_subscription_id (subscription_id),
  KEY idx_status (status),
  KEY idx_created_at (created_at),
  CONSTRAINT subscription_invoices_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT subscription_invoices_ibfk_2 FOREIGN KEY (subscription_id) REFERENCES user_subscriptions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: subscription_events
-- ================================================
-- Log de eventos de Stripe para debugging y auditoría
CREATE TABLE IF NOT EXISTS subscription_events (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  stripe_event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSON DEFAULT NULL,
  processed TINYINT(1) DEFAULT 0,
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_stripe_event (stripe_event_id),
  KEY idx_user_id (user_id),
  KEY idx_event_type (event_type),
  KEY idx_processed (processed),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- DATOS INICIALES: Planes de suscripción
-- ================================================
INSERT INTO subscription_plans (
  name, slug, description, 
  price_monthly, price_yearly, 
  max_teams, max_goalkeepers, max_tasks, max_sessions_per_month,
  has_tactical_editor, has_statistics, has_match_analysis, 
  has_penalty_tracking, has_export_pdf, has_priority_support,
  sort_order, is_popular, features
) VALUES 
(
  'Free', 'free', 'Plan gratuito para comenzar',
  0, 0,
  1, 3, 5, 10,
  0, 0, 0, 0, 0, 0,
  1, 0,
  '["1 equipo", "3 porteros", "5 tareas personalizadas", "10 sesiones/mes", "Soporte por email"]'
),
(
  'Pro', 'pro', 'Todo lo que necesitas para entrenar profesionalmente',
  9.99, 99.00,
  10, 50, 999, 999,
  1, 1, 1, 1, 1, 0,
  2, 1,
  '["10 equipos", "50 porteros", "Tareas ilimitadas", "Sesiones ilimitadas", "Editor táctico completo", "Estadísticas avanzadas", "Análisis de partidos", "Seguimiento de penaltis", "Exportar a PDF", "Soporte prioritario"]'
),
(
  'Elite', 'elite', 'Para clubes y academias profesionales',
  29.99, 299.00,
  999, 999, 999, 999,
  1, 1, 1, 1, 1, 1,
  3, 0,
  '["Equipos ilimitados", "Porteros ilimitados", "Todo incluido en Pro", "API access", "Soporte 24/7", "Onboarding personalizado", "Reportes personalizados"]'
);

-- ================================================
-- VISTA: Resumen de suscripciones de usuarios
-- ================================================
CREATE OR REPLACE VIEW vw_user_subscription_details AS
SELECT 
  u.id AS user_id,
  u.email,
  u.name AS user_name,
  sp.name AS plan_name,
  sp.slug AS plan_slug,
  us.status AS subscription_status,
  us.billing_cycle,
  us.current_period_start,
  us.current_period_end,
  us.cancel_at_period_end,
  sp.max_teams,
  sp.max_goalkeepers,
  sp.max_tasks,
  sp.has_tactical_editor,
  sp.has_statistics,
  sp.has_match_analysis,
  CASE 
    WHEN us.id IS NULL THEN 'free'
    WHEN us.status = 'active' THEN 'active'
    WHEN us.status = 'trialing' THEN 'trialing'
    ELSE 'inactive'
  END AS effective_status
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id;

-- ================================================
-- PROCEDIMIENTO: Verificar límites de suscripción
-- ================================================
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS check_subscription_limits(
  IN p_user_id INT,
  IN p_resource_type VARCHAR(50),
  OUT p_current_count INT,
  OUT p_max_allowed INT,
  OUT p_can_create BOOLEAN
)
BEGIN
  DECLARE v_plan_id INT DEFAULT 1;
  DECLARE v_status VARCHAR(50) DEFAULT 'active';
  
  -- Obtener plan del usuario
  SELECT COALESCE(us.plan_id, 1), COALESCE(us.status, 'active')
  INTO v_plan_id, v_status
  FROM users u
  LEFT JOIN user_subscriptions us ON u.id = us.user_id
  WHERE u.id = p_user_id;
  
  -- Si no tiene suscripción activa, usar plan free
  IF v_status NOT IN ('active', 'trialing') THEN
    SET v_plan_id = 1;
  END IF;
  
  -- Obtener límites según el tipo de recurso
  CASE p_resource_type
    WHEN 'teams' THEN
      SELECT COUNT(*) INTO p_current_count 
      FROM teams WHERE user_id = p_user_id AND is_active = 1;
      SELECT max_teams INTO p_max_allowed 
      FROM subscription_plans WHERE id = v_plan_id;
      
    WHEN 'goalkeepers' THEN
      SELECT COUNT(*) INTO p_current_count 
      FROM goalkeepers g
      JOIN teams t ON g.team_id = t.id
      WHERE t.user_id = p_user_id AND g.is_active = 1;
      SELECT max_goalkeepers INTO p_max_allowed 
      FROM subscription_plans WHERE id = v_plan_id;
      
    WHEN 'tasks' THEN
      SELECT COUNT(*) INTO p_current_count 
      FROM tasks WHERE user_id = p_user_id;
      SELECT max_tasks INTO p_max_allowed 
      FROM subscription_plans WHERE id = v_plan_id;
      
    ELSE
      SET p_current_count = 0;
      SET p_max_allowed = 999;
  END CASE;
  
  SET p_can_create = (p_current_count < p_max_allowed);
END //

DELIMITER ;

COMMIT;
