import { Router } from "express";
import {
  createBin,
  getBins,
  getBinById,
  updateBin,
  deleteBin,
} from "../controllers/binController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Bins
 *   description: Управление контейнерами
 */

/**
 * @swagger
 * /api/bins:
 *   post:
 *     summary: Создать новый контейнер
 *     tags: [Bins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Контейнер успешно создан
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/", authMiddleware, createBin);

/**
 * @swagger
 * /api/bins:
 *   get:
 *     summary: Получить список всех контейнеров
 *     tags: [Bins]
 *     responses:
 *       200:
 *         description: Список контейнеров
 *       500:
 *         description: Ошибка при получении данных
 */
router.get("/", getBins);

/**
 * @swagger
 * /api/bins/{id}:
 *   get:
 *     summary: Получить контейнер по ID
 *     tags: [Bins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Найденный контейнер
 *       404:
 *         description: Контейнер не найден
 *       500:
 *         description: Ошибка при получении контейнера
 */
router.get("/:id", getBinById);

/**
 * @swagger
 * /api/bins/{id}:
 *   put:
 *     summary: Обновить контейнер по ID
 *     tags: [Bins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Контейнер успешно обновлён
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Контейнер не найден
 *       500:
 *         description: Ошибка сервера
 */
router.put("/:id", authMiddleware, updateBin);

/**
 * @swagger
 * /api/bins/{id}:
 *   delete:
 *     summary: Удалить контейнер по ID
 *     tags: [Bins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Контейнер успешно удалён
 *       404:
 *         description: Контейнер не найден
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/:id", authMiddleware, deleteBin);

export default router;
