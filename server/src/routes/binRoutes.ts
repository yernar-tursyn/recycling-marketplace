import express from "express";
import BinController from "../controllers/binController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bins
 *   description: Ячейки/контейнеры внутри склада
 */

/**
 * @swagger
 * /api/bins:
 *   get:
 *     summary: Получить все ячейки
 *     tags: [Bins]
 *     responses:
 *       200:
 *         description: Список всех ячеек
 */
router.get("/", BinController.getAll);

/**
 * @swagger
 * /api/bins/{id}:
 *   get:
 *     summary: Получить ячейку по ID
 *     tags: [Bins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID ячейки
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Найденная ячейка
 *       404:
 *         description: Ячейка не найдена
 */
router.get("/:id", BinController.getById);

/**
 * @swagger
 * /api/bins/storage/{storageId}:
 *   get:
 *     summary: Получить все ячейки по складу
 *     tags: [Bins]
 *     parameters:
 *       - in: path
 *         name: storageId
 *         required: true
 *         description: ID склада
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список ячеек для склада
 */
router.get("/storage/:storageId", BinController.getByStorageId);

/**
 * @swagger
 * /api/bins:
 *   post:
 *     summary: Создать новую ячейку
 *     tags: [Bins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storage_id
 *               - name
 *             properties:
 *               storage_id:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: Контейнер A-1
 *     responses:
 *       201:
 *         description: Ячейка успешно создана
 *       400:
 *         description: Ошибка валидации
 */
router.post("/", BinController.create);

/**
 * @swagger
 * /api/bins/{id}:
 *   put:
 *     summary: Обновить ячейку
 *     tags: [Bins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID ячейки
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storage_id:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: Обновлённый контейнер A-1
 *     responses:
 *       200:
 *         description: Ячейка обновлена
 *       404:
 *         description: Ячейка не найдена
 */
router.put("/:id", BinController.update);

/**
 * @swagger
 * /api/bins/{id}:
 *   delete:
 *     summary: Удалить ячейку
 *     tags: [Bins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID ячейки
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ячейка удалена
 *       404:
 *         description: Ячейка не найдена
 */
router.delete("/:id", BinController.delete);

export default router;
