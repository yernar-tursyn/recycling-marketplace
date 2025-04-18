import db from "../config/db";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";

type NotificationType = "order" | "material" | "system" | "message";

interface Notification extends RowDataPacket {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  entity_id: number | null;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

interface NotificationInput {
  user_id: number;
  title: string;
  message: string;
  type?: NotificationType;
  entity_id?: number;
  is_read?: boolean;
}

interface NotificationUpdate {
  is_read?: boolean;
}

class NotificationModel {
  static async create(notification: NotificationInput): Promise<number> {
    try {
      const [result] = await db.execute(
        `INSERT INTO notifications 
         (user_id, title, message, type, entity_id, is_read) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          notification.user_id,
          notification.title,
          notification.message,
          notification.type || "system",
          notification.entity_id || null,
          notification.is_read || false,
        ]
      );

      if (!(result as any).insertId) {
        throw new Error("Не удалось получить ID созданного уведомления");
      }

      return (result as any).insertId;
    } catch (error) {
      console.error("Ошибка в NotificationModel.create:", error);
      throw error;
    }
  }

  static async findByUserId(user_id: number): Promise<Notification[]> {
    const [rows] = await db.query<Notification[]>(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );
    return rows;
  }

  static async findUnreadByUserId(user_id: number): Promise<Notification[]> {
    const [rows] = await db.query<Notification[]>(
      "SELECT * FROM notifications WHERE user_id = ? AND is_read = false ORDER BY created_at DESC",
      [user_id]
    );
    return rows;
  }

  static async findById(id: number): Promise<Notification | null> {
    const [rows] = await db.query<Notification[]>(
      "SELECT * FROM notifications WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }

  static async update(
    id: number,
    notification: NotificationUpdate
  ): Promise<boolean> {
    const fieldsToUpdate = Object.entries(notification)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => key);

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields to update");
    }

    const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");

    const values: (boolean | number)[] = fieldsToUpdate.map((field) => {
      const value = notification[field as keyof NotificationUpdate];
      if (typeof value === "undefined") {
        throw new Error("Недопустимое значение поля");
      }
      return value;
    });

    values.push(id); // теперь нормально

    const sql = `UPDATE notifications SET ${setClause} WHERE id = ?`;

    try {
      const [result] = await db.execute<ResultSetHeader>(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  }

  static async markAllAsRead(user_id: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE notifications SET is_read = true WHERE user_id = ?",
      [user_id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute(
      "DELETE FROM notifications WHERE id = ?",
      [id]
    );
    return (result as any).affectedRows > 0;
  }

  static async countUnread(user_id: number): Promise<number> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false",
      [user_id]
    );
    return rows[0].count;
  }
}

export {
  Notification,
  NotificationInput,
  NotificationUpdate,
  NotificationType,
  NotificationModel,
};
