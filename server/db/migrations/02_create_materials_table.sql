CREATE TABLE IF NOT EXISTS `materials` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `category_id` TINYINT NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `unit` VARCHAR(20) NOT NULL DEFAULT 'kg',
  `image_url` VARCHAR(255),
  `status` ENUM('Under review', 'Rejected', 'Approved') NOT NULL DEFAULT 'Under review'

  PRIMARY KEY (`id`),
  KEY `idx_materials_category` (`category_id`),
  CONSTRAINT `fk_materials_category`
    FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
