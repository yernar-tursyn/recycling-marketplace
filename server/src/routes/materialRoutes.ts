import { Router } from "express";
import {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  searchMaterials,
} from "../controllers/materialController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Materials
 *   description: Управление материалами
 */

/**
 * @swagger
 * /api/materials:
 *   post:
 *     summary: Создать новый материал
 *     tags: [Materials]
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
 *               - category
 *               - price
 *               - quantity
 *               - location
 *               - seller_id
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               location:
 *                 type: string
 *               seller_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               unit:
 *                 type: string
 *     responses:
 *       201:
 *         description: Материал успешно создан
 *       400:
 *         description: Ошибка валидации или продавец не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/", authMiddleware, createMaterial);

/**
 * @swagger
 * /api/materials/search:
 *   get:
 *     summary: Поиск материалов по ключевым словам, категории и сортировке
 *     tags: [Materials]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Поисковый запрос
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Категория материала
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Критерий сортировки (например price_asc, price_desc)
 *     responses:
 *       200:
 *         description: Результаты поиска
 *       500:
 *         description: Ошибка при поиске
 */
router.get("/search", searchMaterials);

/**
 * @swagger
 * /api/materials:
 *   get:
 *     summary: Получить список всех материалов
 *     tags: [Materials]
 *     responses:
 *       200:
 *         description: Список материалов
 *       500:
 *         description: Ошибка при получении данных
 */
router.get("/", getMaterials);

/**
 * @swagger
 * /api/materials/{id}:
 *   get:
 *     summary: Получить материал по ID
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID материала
 *     responses:
 *       200:
 *         description: Найденный материал
 *       404:
 *         description: Материал не найден
 *       500:
 *         description: Ошибка при получении материала
 */
router.get("/:id", getMaterialById);

/**
 * @swagger
 * /api/materials/{id}:
 *   put:
 *     summary: Обновить материал по ID
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID материала
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Данные для обновления
 *     responses:
 *       200:
 *         description: Материал успешно обновлён
 *       400:
 *         description: Ошибка валидации или отсутствуют данные
 *       404:
 *         description: Материал не найден
 *       500:
 *         description: Ошибка сервера
 */
router.put("/:id", authMiddleware, updateMaterial);

// /**
//  * @swagger
//  * /api/materials/{id}:
//  *   delete:
//  *     summary: Удалить материал по ID
//  *     tags: [Materials]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID материала
//  *     responses:
//  *       200:
//  *         description: Материал успешно удалён
//  *       404:
//  *         description: Материал не найден
//  *       500:
//  *         description: Ошибка при удалении
//  */
router.delete("/:id", authMiddleware, deleteMaterial);

export default router;
