import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController";
import authMiddleware from "../middlewares/authMiddleware";
import roleMiddleware from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Управление заказами
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Создать новый заказ
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - buyer_id
 *               - material_id
 *               - quantity
 *               - price
 *             properties:
 *               buyer_id:
 *                 type: integer
 *               material_id:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *               delivery_address:
 *                 type: string
 *               contact_phone:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Заказ успешно создан
 *       400:
 *         description: Ошибка валидации или материал/покупатель не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/", authMiddleware, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Получить список заказов
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: buyer_id
 *         schema:
 *           type: integer
 *         description: Фильтр по ID покупателя
 *     responses:
 *       200:
 *         description: Список заказов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderWithDetails'
 *       500:
 *         description: Ошибка при получении данных
 */
router.get("/", authMiddleware, getOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Получить заказ по ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заказа
 *     responses:
 *       200:
 *         description: Найденный заказ
 *       404:
 *         description: Заказ не найден
 *       500:
 *         description: Ошибка при получении заказа
 */
router.get("/:id", authMiddleware, getOrderById);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Обновить заказ по ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - roleMiddleware: ['admin', 'manager']
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заказа
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, completed, cancelled]
 *               delivery_address:
 *                 type: string
 *               contact_phone:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Заказ успешно обновлён
 *       400:
 *         description: Ошибка валидации или отсутствуют данные
 *       403:
 *         description: Нет прав для обновления заказа
 *       404:
 *         description: Заказ не найден
 *       500:
 *         description: Ошибка сервера
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  updateOrder
);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Удаление заказа по ID
 *     description: Удаляет заказ с указанным идентификатором. Требуется авторизация.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *       - roleMiddleware: ['admin']
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Уникальный идентификатор заказа
 *         schema:
 *           type: integer
 *           example: 42
 *     responses:
 *       200:
 *         description: Заказ успешно удалён
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
 *       403:
 *         description: Нет прав для удаления заказа
 *       404:
 *         description: Заказ не найден
 *       500:
 *         description: Внутренняя ошибка сервера при удалении
 */
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteOrder);

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderWithDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         buyer_id:
 *           type: integer
 *         material_id:
 *           type: integer
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 *         total_amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, completed, cancelled]
 *         delivery_address:
 *           type: string
 *         contact_phone:
 *           type: string
 *         notes:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         material_name:
 *           type: string
 *         material_category:
 *           type: integer
 *         material_image:
 *           type: string
 *         buyer_name:
 *           type: string
 *         buyer_email:
 *           type: string
 */

export default router;
