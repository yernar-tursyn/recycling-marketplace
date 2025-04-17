CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT 'Кому предназначено уведомление',
  `title` VARCHAR(255) NOT NULL COMMENT 'Заголовок уведомления',
  `message` TEXT NOT NULL COMMENT 'Основной текст уведомления',
  `type` ENUM('order','material','system','message') DEFAULT 'system' COMMENT 'Тип уведомления',
  `entity_id` INT DEFAULT NULL COMMENT 'ID сущности, к которой относится уведомление (например, заказ)',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Прочитано ли уведомление',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `type` (`type`),
  
  CONSTRAINT `notifications_ibfk_1`
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Уведомления для пользователей';
