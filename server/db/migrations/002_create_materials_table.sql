CREATE TABLE IF NOT EXISTS `materials` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `category_id` TINYINT NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `unit` VARCHAR(20) NOT NULL DEFAULT 'kg',
  `image_url` VARCHAR(255) DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `materials_fk_category` 
    FOREIGN KEY (`category_id`) 
    REFERENCES `categories` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;