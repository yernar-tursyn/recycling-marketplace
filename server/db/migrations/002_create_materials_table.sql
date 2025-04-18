CREATE TABLE IF NOT EXISTS `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` tinyint NOT NULL COMMENT '1-Пластик, 2-Макулатура, 3-Стекло, 4-Металл, 5-Кожа/резина/ветошь, 6-Органика, 7-Отходы',
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `unit` varchar(20) NOT NULL DEFAULT 'kg',
  `location` varchar(100) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;