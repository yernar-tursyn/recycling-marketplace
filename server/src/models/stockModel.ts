import db from "../config/db";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";

interface Stock extends RowDataPacket {
  id: number;
  material_id: number;
  storage_id: number;
  quantity: number;
  seller_id: number;
  created_at: string;
  updated_at: string;
}

interface StockInput {
  material_id: number;
  storage_id: number;
  quantity: number;
  seller_id: number;
}

class StockModel {
  static async create(stock: StockInput): Promise<number> {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO stocks 
       (material_id, storage_id, quantity, seller_id) 
       VALUES (?, ?, ?, ?)`,
      [stock.material_id, stock.storage_id, stock.quantity, stock.seller_id]
    );
    return result.insertId;
  }

  static async findAll(): Promise<Stock[]> {
    const [rows] = await db.query<Stock[]>("SELECT * FROM stocks");
    return rows;
  }

  static async findById(id: number): Promise<Stock | null> {
    const [rows] = await db.query<Stock[]>(
      "SELECT * FROM stocks WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }

  static async findByMaterial(material_id: number): Promise<Stock[]> {
    const [rows] = await db.query<Stock[]>(
      "SELECT * FROM stocks WHERE material_id = ?",
      [material_id]
    );
    return rows;
  }

  static async findByStorage(storage_id: number): Promise<Stock[]> {
    const [rows] = await db.query<Stock[]>(
      "SELECT * FROM stocks WHERE storage_id = ?",
      [storage_id]
    );
    return rows;
  }

  static async update(
    id: number,
    stock: Partial<StockInput>
  ): Promise<boolean> {
    const fieldsToUpdate = Object.entries(stock)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => key);

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields to update");
    }

    const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
    const values = fieldsToUpdate.map(
      (field) => stock[field as keyof typeof stock]
    );
    values.push(id);

    const sql = `UPDATE stocks SET ${setClause} WHERE id = ?`;

    try {
      const [result] = await db.execute<ResultSetHeader>(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM stocks WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

export { Stock, StockInput, StockModel };
