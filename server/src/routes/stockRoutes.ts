import { Router } from "express";
import {
  createStock,
  getStocks,
  getStockById,
  getStocksByMaterial,
  getStocksByBin, // Изменено с getStocksByStorage на getStocksByBin
  updateStock,
  deleteStock,
  findAvailableStocks,
  getAvailableStocksByMaterial,
} from "../controllers/stockController";
import authMiddleware from "../middlewares/authMiddleware";
import roleMiddleware from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Stocks
 *   description: Stock management
 */

/**
 * @swagger
 * /api/stocks:
 *   post:
 *     summary: Create new stock entry
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - material_id
 *               - bin_id
 *               - quantity
 *               - seller_id
 *             properties:
 *               material_id:
 *                 type: integer
 *               bin_id:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               seller_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Stock created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, createStock);

/**
 * @swagger
 * /api/stocks:
 *   get:
 *     summary: Get all stocks
 *     tags: [Stocks]
 *     responses:
 *       200:
 *         description: List of all stocks
 *       500:
 *         description: Server error
 */
router.get("/", getStocks);

/**
 * @swagger
 * /api/stocks/available:
 *   get:
 *     summary: Get all stocks with quantity > 0 and status = "active"
 *     tags: [Stocks]
 *     responses:
 *       200:
 *         description: List of available stocks
 *       500:
 *         description: Server error
 */
router.get("/available", findAvailableStocks);

/**
 * @swagger
 * api/stocks/available/material/:materialId:
 *   get:
 *     summary: Получить все доступные запасы по определённому материалу
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID материала
 *     responses:
 *       200:
 *         description: Успешный ответ с доступными запасами
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   material_id:
 *                     type: integer
 *                   material_name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   storage_name:
 *                     type: string
 *                   weight:
 *                     type: number
 *                   is_active:
 *                     type: boolean
 *       400:
 *         description: Неверный ID материала
 *       404:
 *         description: Нет доступных запасов для указанного материала
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/available/material/:materialId", getAvailableStocksByMaterial);

/**
 * @swagger
 * /api/stocks/{id}:
 *   get:
 *     summary: Get stock by ID
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stock data
 *       404:
 *         description: Stock not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getStockById);

/**
 * @swagger
 * /api/stocks/material/{material_id}:
 *   get:
 *     summary: Get stocks by material ID
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: material_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of stocks for material
 *       500:
 *         description: Server error
 */
router.get("/material/:material_id", getStocksByMaterial);

/**
 * @swagger
 * /api/stocks/bin/{bin_id}:
 *   get:
 *     summary: Get stocks by bin ID
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: bin_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of stocks in bin
 *       500:
 *         description: Server error
 */
router.get("/bin/:bin_id", getStocksByBin); // Изменено с getStocksByStorage на getStocksByBin

/**
 * @swagger
 * /api/stocks/{id}:
 *   put:
 *     summary: Update stock
 *     tags: [Stocks]
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
 *               material_id:
 *                 type: integer
 *               bin_id:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               seller_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Stock not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updateStock);

/**
 * @swagger
 * /api/stocks/{id}:
 *   delete:
 *     summary: Delete stock
 *     tags: [Stocks]
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
 *         description: Stock deleted
 *       404:
 *         description: Stock not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteStock);

export default router;
