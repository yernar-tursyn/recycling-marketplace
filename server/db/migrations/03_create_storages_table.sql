CREATE TABLE IF NOT EXISTS `storages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,     -- Наименование склада
  `location` VARCHAR(255),          -- Адрес или описание местоположения склада
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;