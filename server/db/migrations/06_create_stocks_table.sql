CREATE TABLE IF NOT EXISTS `stocks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `material_id` INT NOT NULL,
  `bin_id` INT NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,  -- Вес в кг
  `seller_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_stocks_material` (`material_id`),
  KEY `idx_stocks_bin` (`bin_id`),
  KEY `idx_stocks_seller` (`seller_id`),
  CONSTRAINT `fk_stocks_material`
    FOREIGN KEY (`material_id`)
    REFERENCES `materials` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_stocks_bin`
    FOREIGN KEY (`bin_id`)
    REFERENCES `bins` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_stocks_seller`
    FOREIGN KEY (`seller_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;