-- ================================================
-- MIGRACIÓN: Vincular Editor Táctico con Tareas
-- ================================================
-- Fecha: 2025-12-11
-- Descripción: Agrega columna design_id a tasks para vincular con training_designs
-- ================================================

USE goalkeeper_training;

-- Agregar columna design_id a tasks
ALTER TABLE tasks 
ADD COLUMN design_id INT DEFAULT NULL COMMENT 'ID del diseño táctico asociado';

-- Crear índice para mejorar consultas
ALTER TABLE tasks 
ADD KEY idx_design_id (design_id);

-- Agregar constraint de foreign key
ALTER TABLE tasks 
ADD CONSTRAINT tasks_design_fk 
FOREIGN KEY (design_id) REFERENCES training_designs(id) ON DELETE SET NULL;

-- Verificar estructura
DESCRIBE tasks;

-- Mensaje de éxito
SELECT 'Migración completada: design_id agregado a tasks' AS status;
