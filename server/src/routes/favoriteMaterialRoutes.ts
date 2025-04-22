import { Router } from "express";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from "../controllers/favoritesMaterialController";
import authMiddleware from "../middlewares/authMiddleware";
import roleMiddleware from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Избранные материалы
 */
/**
 * @swagger
 * /api/favorites/{userId}:
 *   get:
 *     summary: Получить все избранные материалы пользователя
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Уникальный идентификатор пользователя
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список избранных материалов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                     format: float
 *       500:
 *         description: Ошибка сервера
 */
router.get("/:userId", authMiddleware, getFavorites);

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Добавить материал в избранное
 *     tags: [Favorites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - materialId
 *             properties:
 *               userId:
 *                 type: integer
 *               materialId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Материал успешно добавлен в избранное
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", authMiddleware, addFavorite);

/**
 * @swagger
 * /api/favorites:
 *   delete:
 *     summary: Удалить материал из избранного
 *     tags: [Favorites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - materialId
 *             properties:
 *               userId:
 *                 type: integer
 *               materialId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Материал успешно удалён из избранного
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/", authMiddleware, removeFavorite);

/**
 * @swagger
 * /api/favorites/check/{userId}/{materialId}:
 *   get:
 *     summary: Проверить, является ли материал избранным у пользователя
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Уникальный идентификатор пользователя
 *         schema:
 *           type: integer
 *       - in: path
 *         name: materialId
 *         required: true
 *         description: Уникальный идентификатор материала
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Проверка, является ли материал избранным
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFavorite:
 *                   type: boolean
 *       500:
 *         description: Ошибка сервера
 */
router.get("/check/:userId/:materialId", authMiddleware, checkFavorite);

export default router;
