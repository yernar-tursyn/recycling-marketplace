import db from "../config/db";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";

interface Order extends RowDataPacket {
  id: number;
  buyer_id: number;
  material_id: number;
  quantity: number;
  price: number;
  total_amount: number;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  delivery_address?: string;
  contact_phone?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

interface OrderInput {
  buyer_id: number;
  material_id: number;
  quantity: number;
  price: number;
  delivery_address?: string;
  contact_phone?: string;
  notes?: string;
}

interface OrderUpdate {
  status?: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  delivery_address?: string;
  contact_phone?: string;
  notes?: string;
}

class OrderModel {
  static async create(order: OrderInput): Promise<number> {
    try {
      const [result] = await db.execute(
        `INSERT INTO orders 
         (buyer_id, material_id, quantity, price, delivery_address, contact_phone, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          order.buyer_id,
          order.material_id,
          order.quantity,
          order.price,
          order.delivery_address || null,
          order.contact_phone || null,
          order.notes || null,
        ]
      );

      if (!(result as any).insertId) {
        throw new Error("Не удалось получить ID созданного заказа");
      }

      return (result as any).insertId;
    } catch (error) {
      console.error("Ошибка в OrderModel.create:", error);
      throw error;
    }
  }

  static async findAll(): Promise<Order[]> {
    const [rows] = await db.query<Order[]>("SELECT * FROM orders");
    return rows;
  }

  static async findById(id: number): Promise<Order | null> {
    const [rows] = await db.query<Order[]>(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }

  static async findByBuyerId(buyer_id: number): Promise<Order[]> {
    const [rows] = await db.query<Order[]>(
      "SELECT * FROM orders WHERE buyer_id = ?",
      [buyer_id]
    );
    return rows;
  }

  static async update(id: number, order: OrderUpdate): Promise<boolean> {
    const fieldsToUpdate = Object.entries(order)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => key);

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields to update");
    }

    const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
    const values: (string | number | null)[] = fieldsToUpdate.map(
      (field) => order[field as keyof OrderUpdate] ?? null
    );

    values.push(id);

    const sql = `UPDATE orders SET ${setClause} WHERE id = ?`;

    try {
      const [result] = await db.execute<ResultSetHeader>(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute("DELETE FROM orders WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  static async getOrdersWithMaterials(buyer_id?: number): Promise<any[]> {
    let sql = `
      SELECT 
        o.*, 
        m.name as material_name, 
        m.category as material_category,
        m.image_url as material_image,
        u.name as buyer_name,
        u.email as buyer_email
      FROM orders o
      JOIN materials m ON o.material_id = m.id
      JOIN users u ON o.buyer_id = u.id
    `;

    const params = [];

    if (buyer_id) {
      sql += " WHERE o.buyer_id = ?";
      params.push(buyer_id);
    }

    sql += " ORDER BY o.created_at DESC";

    const [rows] = await db.query<any[]>(sql, params);
    return rows;
  }
}

export { Order, OrderInput, OrderUpdate, OrderModel };
