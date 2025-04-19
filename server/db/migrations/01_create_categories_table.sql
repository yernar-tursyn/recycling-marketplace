CREATE TABLE IF NOT EXISTS `categories` (
  `id` TINYINT NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `name`) VALUES
  (1, 'Пластик'),
  (2, 'Макулатура'),
  (3, 'Стекло'),
  (4, 'Металл'),
  (5, 'Кожа, резина, ветошь'),
  (6, 'Органика'),
  (7, 'Отходы') AS new
ON DUPLICATE KEY UPDATE `name` = new.`name`;