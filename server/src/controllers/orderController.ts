import { Request, Response } from "express";
import { OrderModel, OrderInput, OrderUpdate } from "../models/orderModel";
import { QueryError } from "mysql2";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { buyer_id, material_id, quantity, price } = req.body;

    if (!buyer_id || !material_id || !quantity || !price) {
      return res.status(400).json({
        error: "Необходимо заполнить все обязательные поля",
      });
    }

    const orderData: OrderInput = {
      buyer_id: Number(buyer_id),
      material_id: Number(material_id),
      quantity: Number(quantity),
      price: Number(price),
      delivery_address: req.body.delivery_address || null,
      contact_phone: req.body.contact_phone || null,
      notes: req.body.notes || null,
    };

    const id = await OrderModel.create(orderData);
    const createdOrder = await OrderModel.findById(id);

    return res.status(201).json(createdOrder);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Ошибка создания заказа:", error.message);

      if (isQueryError(error)) {
        console.error("MySQL Error Code:", error.code);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
          return res.status(400).json({
            error: "Указанный покупатель или материал не существует",
            details:
              process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
          });
        }
      }

      return res.status(500).json({
        error: "Ошибка при создании заказа",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    return res.status(500).json({
      error: "Неизвестная ошибка при создании заказа",
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.query.buyer_id
      ? Number(req.query.buyer_id)
      : undefined;
    const orders = await OrderModel.getOrdersWithMaterials(buyer_id);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при получении заказов" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await OrderModel.findById(Number(req.params.id));
    if (!order) {
      return res.status(404).json({ error: "Заказ не найден" });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при получении заказа" });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Нет данных для обновления" });
    }

    const allowedFields = [
      "status",
      "delivery_address",
      "contact_phone",
      "notes",
    ];
    const updateData: OrderUpdate = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field as keyof OrderUpdate] = req.body[field];
      }
    }

    const success = await OrderModel.update(Number(req.params.id), updateData);

    if (!success) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    const updatedOrder = await OrderModel.findById(Number(req.params.id));
    res.json({
      success: true,
      message: "Заказ успешно обновлён",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order error:", error);

    if (error instanceof Error) {
      return res.status(400).json({
        error: "Ошибка при обновлении заказа",
        details: error.message,
      });
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const success = await OrderModel.delete(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Заказ не найден" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при удалении заказа" });
  }
};

function isQueryError(error: unknown): error is QueryError {
  return typeof error === "object" && error !== null && "code" in error;
}
