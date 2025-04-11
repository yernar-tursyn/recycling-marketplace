import db from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import mysql from "mysql2/promise";

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

  static async findAll(): Promise<Material[]> {
    const [rows] = await db.query<Material[]>("SELECT * FROM materials");
    return rows;
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

  static async delete(
    id: number
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const [result] = await db.execute<ResultSetHeader>(
        "DELETE FROM materials WHERE id = ?",
        [id]
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? `Материал с ID ${id} успешно удален`
            : `Материал с ID ${id} не найден`,
      };
    } catch (error) {
      console.error("Delete error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Ошибка при удалении",
      };
    }
  }

  static async findById(id: number): Promise<Material | null> {
    try {
      const [rows] = await db.query<Material[]>(
        `SELECT 
          id, name, category, description, 
          price, quantity, unit, location,
          seller_id, image_url, created_at, updated_at
         FROM materials WHERE id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Find by ID error:", error);
      throw new Error("Ошибка при поиске материала");
    }
  }
}

export { Material, MaterialInput, MaterialModel };
