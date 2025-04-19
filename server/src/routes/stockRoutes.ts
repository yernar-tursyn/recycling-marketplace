import { Router } from "express";
import {
  createStock,
  getStocks,
  getStockById,
  getStocksByMaterial,
  getStocksByStorage,
  updateStock,
  deleteStock,
} from "../controllers/stockController";
import authMiddleware from "../middlewares/authMiddleware";

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
 *               - storage_id
 *               - quantity
 *               - seller_id
 *             properties:
 *               material_id:
 *                 type: integer
 *               storage_id:
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
 * /api/stocks/storage/{storage_id}:
 *   get:
 *     summary: Get stocks by storage ID
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: storage_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of stocks in storage
 *       500:
 *         description: Server error
 */
router.get("/storage/:storage_id", getStocksByStorage);

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
 *               storage_id:
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
