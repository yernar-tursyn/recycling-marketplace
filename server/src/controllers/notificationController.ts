import { Request, Response } from "express";
import {
  NotificationModel,
  NotificationInput,
  NotificationUpdate,
} from "../models/notificationModel";
import { QueryError } from "mysql2";

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { user_id, title, message } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        error: "Необходимо указать user_id, title и message",
      });
    }

    const notificationData: NotificationInput = {
      user_id: Number(user_id),
      title,
      message,
      type: req.body.type || "system",
      entity_id: req.body.entity_id || null,
      is_read: req.body.is_read || false,
    };

    const id = await NotificationModel.create(notificationData);
    const createdNotification = await NotificationModel.findById(id);

    return res.status(201).json(createdNotification);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Ошибка создания уведомления:", error.message);

      if (isQueryError(error)) {
        console.error("MySQL Error Code:", error.code);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
          return res.status(400).json({
            error: "Указанный пользователь не существует",
            details:
              process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
          });
        }
      }

      return res.status(500).json({
        error: "Ошибка при создании уведомления",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    return res.status(500).json({
      error: "Неизвестная ошибка при создании уведомления",
    });
  }
};

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.params.user_id);
    const notifications = await NotificationModel.findByUserId(user_id);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при получении уведомлений" });
  }
};

export const getUnreadNotifications = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.params.user_id);
    const notifications = await NotificationModel.findUnreadByUserId(user_id);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Ошибка при получении непрочитанных уведомлений" });
  }
};

export const getNotificationById = async (req: Request, res: Response) => {
  try {
    const notification = await NotificationModel.findById(
      Number(req.params.id)
    );
    if (!notification) {
      return res.status(404).json({ error: "Уведомление не найдено" });
    }
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при получении уведомления" });
  }
};

export const updateNotification = async (req: Request, res: Response) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Нет данных для обновления" });
    }

    const allowedFields = ["is_read"];
    const updateData: NotificationUpdate = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field as keyof NotificationUpdate] = req.body[field];
      }
    }

    const success = await NotificationModel.update(
      Number(req.params.id),
      updateData
    );

    if (!success) {
      return res.status(404).json({ error: "Уведомление не найдено" });
    }

    const updatedNotification = await NotificationModel.findById(
      Number(req.params.id)
    );
    res.json({
      success: true,
      message: "Уведомление успешно обновлено",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Update notification error:", error);

    if (error instanceof Error) {
      return res.status(400).json({
        error: "Ошибка при обновлении уведомления",
        details: error.message,
      });
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.params.user_id);
    const success = await NotificationModel.markAllAsRead(user_id);

    if (!success) {
      return res
        .status(404)
        .json({ error: "Пользователь не найден или нет уведомлений" });
    }

    res.json({
      success: true,
      message: "Все уведомления помечены как прочитанные",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при обновлении уведомлений" });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.params.user_id);
    const count = await NotificationModel.countUnread(user_id);
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Ошибка при получении количества непрочитанных уведомлений",
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const success = await NotificationModel.delete(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Уведомление не найдено" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при удалении уведомления" });
  }
};

function isQueryError(error: unknown): error is QueryError {
  return typeof error === "object" && error !== null && "code" in error;
}
