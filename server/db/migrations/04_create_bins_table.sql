CREATE TABLE IF NOT EXISTS `bins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `storage_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,     -- Номер/название ячейки или контейнера
  PRIMARY KEY (`id`),
  KEY `idx_bins_storage` (`storage_id`),
  CONSTRAINT `fk_bins_storage`
    FOREIGN KEY (`storage_id`)
    REFERENCES `storages` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;