import { Router } from "express";
import {
  createStorage,
  getStorages,
  getStorageById,
  updateStorage,
  deleteStorage,
} from "../controllers/storageController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Storages
 *   description: Storage management
 */

/**
 * @swagger
 * /api/storages:
 *   post:
 *     summary: Create new storage
 *     tags: [Storages]
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
 *         description: Storage created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, createStorage);

/**
 * @swagger
 * /api/storages:
 *   get:
 *     summary: Get all storages
 *     tags: [Storages]
 *     responses:
 *       200:
 *         description: List of storages
 *       500:
 *         description: Server error
 */
router.get("/", getStorages);

/**
 * @swagger
 * /api/storages/{id}:
 *   get:
 *     summary: Get storage by ID
 *     tags: [Storages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Storage data
 *       404:
 *         description: Storage not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getStorageById);

/**
 * @swagger
 * /api/storages/{id}:
 *   put:
 *     summary: Update storage
 *     tags: [Storages]
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
 *         description: Storage updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Storage not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updateStorage);

/**
 * @swagger
 * /api/storages/{id}:
 *   delete:
 *     summary: Delete storage
 *     tags: [Storages]
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
 *         description: Storage deleted
 *       404:
 *         description: Storage not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteStorage);

export default router;
