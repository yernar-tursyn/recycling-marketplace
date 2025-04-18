import { Router } from "express";
import {
  createNotification,
  getUserNotifications,
  getUnreadNotifications,
  getNotificationById,
  updateNotification,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
} from "../controllers/notificationController";
import authMiddleware from "../middlewares/authMiddleware";
import roleMiddleware from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Управление уведомлениями
 */

/**
 * @swagger
 * /api/notifications/create:
 *   post:
 *     summary: Создать новое уведомление (need to be admin or manager)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - title
 *               - message
 *             properties:
 *               user_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [order, material, system, message]
 *                 default: system
 *               entity_id:
 *                 type: integer
 *               is_read:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Уведомление успешно создано
 *       400:
 *         description: Ошибка валидации или пользователь не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/create", authMiddleware, createNotification);

/**
 * @swagger
 * /api/notifications/user/{user_id}:
 *   get:
 *     summary: Получить уведомления пользователя
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Список уведомлений
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Ошибка при получении данных
 */
router.get("/user/:user_id", authMiddleware, getUserNotifications);

/**
 * @swagger
 * /api/notifications/user/{user_id}/unread:
 *   get:
 *     summary: Получить непрочитанные уведомления пользователя
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Список непрочитанных уведомлений
 *       500:
 *         description: Ошибка при получении данных
 */
router.get("/user/:user_id/unread", authMiddleware, getUnreadNotifications);

// /**
//  * @swagger
//  * /api/notifications/user/{user_id}/unread/count:
//  *   get:
//  *     summary: Получить количество непрочитанных уведомлений
//  *     tags: [Notifications]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: user_id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID пользователя
//  *     responses:
//  *       200:
//  *         description: Количество непрочитанных уведомлений
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 count:
//  *                   type: integer
//  *       500:
//  *         description: Ошибка при получении данных
//  */
router.get("/user/:user_id/unread/count", authMiddleware, getUnreadCount);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Получить уведомление по ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID уведомления
 *     responses:
 *       200:
 *         description: Найденное уведомление
 *       404:
 *         description: Уведомление не найдено
 *       500:
 *         description: Ошибка при получении уведомления
 */
router.get("/:id", authMiddleware, getNotificationById);

/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: Обновить уведомление по ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID уведомления
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_read:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Уведомление успешно обновлено
 *       400:
 *         description: Ошибка валидации или отсутствуют данные
 *       404:
 *         description: Уведомление не найдено
 *       500:
 *         description: Ошибка сервера
 */
router.put("/:id", authMiddleware, updateNotification);

// /**
//  * @swagger
//  * /api/notifications/user/{user_id}/mark-all-read:
//  *   post:
//  *     summary: Пометить все уведомления как прочитанные
//  *     tags: [Notifications]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: user_id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID пользователя
//  *     responses:
//  *       200:
//  *         description: Все уведомления помечены как прочитанные
//  *       404:
//  *         description: Пользователь не найден или нет уведомлений
//  *       500:
//  *         description: Ошибка при обновлении уведомлений
//  */
router.post("/user/:user_id/mark-all-read", authMiddleware, markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Удаление уведомления по ID
 *     description: Удаляет уведомление с указанным идентификатором. Требуется авторизация.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Уникальный идентификатор уведомления
 *         schema:
 *           type: integer
 *           example: 42
 *     responses:
 *       200:
 *         description: Уведомление успешно удалено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Ошибка авторизации
 *       404:
 *         description: Уведомление не найдено
 *       500:
 *         description: Внутренняя ошибка сервера при удалении
 */
router.delete("/:id", authMiddleware, deleteNotification);

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         type:
 *           type: string
 *           enum: [order, material, system, message]
 *         entity_id:
 *           type: integer
 *         is_read:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export default router;
