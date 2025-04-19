CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `buyer_id` INT,  -- теперь можно NULL
  `material_id` INT,
  `quantity` DECIMAL(10,2) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,            -- Цена за единицу (за кг)
  `total_amount` DECIMAL(12,2) NOT NULL,     -- Итоговая сумма
  `status` ENUM('pending','approved','rejected','completed','cancelled') NOT NULL DEFAULT 'pending',
  `bin_id` INT,
  `delivery_address` VARCHAR(255),
  `contact_phone` VARCHAR(50),
  `notes` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_orders_buyer` (`buyer_id`),
  KEY `idx_orders_material` (`material_id`),
  KEY `idx_orders_bin` (`bin_id`),
  CONSTRAINT `fk_orders_buyer`
    FOREIGN KEY (`buyer_id`)
    REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_material`
    FOREIGN KEY (`material_id`)
    REFERENCES `materials` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_bin`
    FOREIGN KEY (`bin_id`)
    REFERENCES `bins` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
