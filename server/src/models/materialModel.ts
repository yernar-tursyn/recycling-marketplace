import db from "../config/db";
import { RowDataPacket } from "mysql2";
import mysql from "mysql2/promise";
import { ResultSetHeader } from "mysql2";

interface Material extends RowDataPacket {
  id: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  seller_id: number;
  image_url?: string;
}

interface MaterialInput {
  name: string;
  category: string;
  description?: string;
  price: number;
  quantity: number;
  unit?: string;
  location: string;
  seller_id: number;
  image_url?: string;
}

class MaterialModel {
  static async create(material: MaterialInput): Promise<number> {
    try {
      const [result] = await db.execute(
        `INSERT INTO materials 
         (name, category, description, price, quantity, unit, location, seller_id, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          material.name,
          material.category,
          material.description || null,
          material.price,
          material.quantity,
          material.unit || "kg",
          material.location,
          material.seller_id,
          material.image_url || null,
        ]
      );

      if (!(result as any).insertId) {
        throw new Error("Не удалось получить ID созданного материала");
      }

      return (result as any).insertId;
    } catch (error) {
      console.error("Ошибка в MaterialModel.create:", error);
      throw error; // Пробрасываем ошибку дальше
    }
  }

  static async findAll(): Promise<Material[]> {
    const [rows] = await db.query<Material[]>("SELECT * FROM materials");
    return rows;
  }

  static async findById(id: number): Promise<Material | null> {
    const [rows] = await db.query<Material[]>(
      "SELECT * FROM materials WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }

  static async update(
    id: number,
    material: Partial<MaterialInput>
  ): Promise<boolean> {
    // Фильтруем поля для обновления
    const fieldsToUpdate = Object.entries(material)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => key);

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields to update");
    }

    // Строим динамический запрос
    const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
    const values = fieldsToUpdate.map(
      (field) => material[field as keyof typeof material]
    );
    values.push(id);

    const sql = `UPDATE materials SET ${setClause} WHERE id = ?`;

    try {
      const [result] = await db.execute<ResultSetHeader>(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute("DELETE FROM materials WHERE id = ?", [
      id,
    ]);
    return (result as any).affectedRows > 0;
  }

  static async search(
    query?: string,
    category?: string,
    sort?: string
  ): Promise<Material[]> {
    let sql = "SELECT * FROM materials WHERE 1=1";
    const params = [];

    if (query) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${query}%`, `%${query}%`);
    }

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (sort === "price") {
      sql += " ORDER BY price";
    } else if (sort === "date") {
      sql += " ORDER BY created_at DESC";
    }

    const [rows] = await db.query<Material[]>(sql, params);
    return rows;
  }
}

export { Material, MaterialInput, MaterialModel };
