-- ================================================
-- LIMPIEZA Y RECREACIÓN DE TABLA verification_tokens
-- ================================================

USE goalkeeper_training;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS before_insert_verification_token;

-- Eliminar tabla si existe
DROP TABLE IF EXISTS verification_tokens;

-- Crear tabla sin trigger
CREATE TABLE verification_tokens (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  type ENUM('email_verification', 'password_reset') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_token (token),
  KEY idx_type (type),
  KEY idx_expires_at (expires_at),
  CONSTRAINT verification_tokens_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabla verification_tokens creada exitosamente' AS status;
