CREATE TABLE IF NOT EXISTS `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` tinyint NOT NULL COMMENT '1-Пластик, 2-Макулатура, 3-Стекло, 4-Металл, 5-Кожа/резина/ветошь, 6-Органика, 7-Отходы',
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(20) NOT NULL DEFAULT 'kg',
  `location` varchar(100) NOT NULL,
  `seller_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `image_url` varchar(255) DEFAULT NULL,
  
  -- Добавленные поля для фронтенда
  `deal_type` enum('buy','sell') DEFAULT 'sell',
  `status` varchar(20) DEFAULT 'active',
  
  PRIMARY KEY (`id`),
  KEY `seller_id` (`seller_id`),
  CONSTRAINT `materials_ibfk_1` 
    FOREIGN KEY (`seller_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;