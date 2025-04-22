CREATE TABLE favorite_materials (
  user_id INT NOT NULL COMMENT 'ID пользователя, добавившего материал в избранное',
  material_id INT NOT NULL COMMENT 'ID избранного материала',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата добавления в избранное',
  PRIMARY KEY (user_id, material_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
