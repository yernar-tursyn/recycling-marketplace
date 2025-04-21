import { Router } from "express";
import {
  register,
  login,
  getProfile,
  deleteUser,
} from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";
import roleMiddleware from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Аутентификация пользователей
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - userType
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [buyer, seller]  # или что у тебя используется
 *     responses:
 *       201:
 *         description: Успешная регистрация
 *       400:
 *         description: Email уже используется
 *       500:
 *         description: Ошибка сервера
 */
router.post("/register", register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Вход пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Неверные учетные данные
 *       500:
 *         description: Ошибка сервера
 */
router.post("/login", login);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Получить профиль пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Профиль пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 userType:
 *                   type: string
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */
router.get("/profile", authMiddleware, getProfile);

/**
 * @swagger
 * /api/profile:
 *   delete:
 *     summary: Удалить свой профиль
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Профиль успешно удалён
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Ошибка сервера при удалении профиля
 */
router.delete("/profile", authMiddleware, deleteUser);

/**
 * @swagger
 * /api/users/user/{id}:
 *   delete:
 *     summary: Удалить пользователя по ID (только для админов)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Уникальный идентификатор пользователя
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь успешно удалён
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Пользователь удалён
 *       401:
 *         description: Неавторизован
 *       403:
 *         description: Недостаточно прав для удаления пользователя
 *       404:
 *         description: Пользователь не найден
 */
router.delete("/user/:id", authMiddleware, roleMiddleware, deleteUser);

export default router;
