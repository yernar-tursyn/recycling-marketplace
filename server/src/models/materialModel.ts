import db from "../config/db";
import { RowDataPacket } from "mysql2";

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
    const [result] = await db.execute(
      `UPDATE materials SET 
       name = ?, category = ?, description = ?, price = ?, 
       quantity = ?, unit = ?, location = ?, image_url = ?
       WHERE id = ?`,
      [
        material.name,
        material.category,
        material.description,
        material.price,
        material.quantity,
        material.unit,
        material.location,
        material.image_url,
        id,
      ]
    );
    return (result as any).affectedRows > 0;
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
