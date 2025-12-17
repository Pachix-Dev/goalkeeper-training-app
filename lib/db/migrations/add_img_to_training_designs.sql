-- Agregar campo img a training_designs para almacenar el nombre de la imagen generada
USE goalkeeper_training;

ALTER TABLE training_designs
ADD COLUMN img VARCHAR(255) DEFAULT NULL COMMENT 'Nombre del archivo PNG generado (UUID.png)' AFTER data;

-- Crear índice para búsquedas por imagen
ALTER TABLE training_designs
ADD KEY idx_img (img);
