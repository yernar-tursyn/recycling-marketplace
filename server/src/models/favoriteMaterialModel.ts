import db from "../config/db";

interface FavoriteMaterial {
  user_id: number;
  material_id: number;
}

interface MaterialWithCategory {
  id: number;
  name: string;
  category_id: number;
  description: string;
  price: number;
  unit: string;
  image_url: string | null;
  status: "Under review" | "Rejected" | "Approved";
  category_name: string;
}

class FavoriteMaterialModel {
  static async add(userId: number, materialId: number): Promise<void> {
    await db.execute(
      `INSERT IGNORE INTO favorite_materials (user_id, material_id) VALUES (?, ?)`,
      [userId, materialId]
    );
  }

  static async remove(userId: number, materialId: number): Promise<void> {
    await db.execute(
      `DELETE FROM favorite_materials WHERE user_id = ? AND material_id = ?`,
      [userId, materialId]
    );
  }

  static async getFavorites(userId: number): Promise<MaterialWithCategory[]> {
    const [rows] = await db.execute(
      `SELECT 
         m.*, 
         c.name AS category_name
       FROM favorite_materials f
       JOIN materials m ON f.material_id = m.id
       JOIN categories c ON m.category_id = c.id
       WHERE f.user_id = ?`,
      [userId]
    );
    return rows as MaterialWithCategory[];
  }

  static async isFavorite(
    userId: number,
    materialId: number
  ): Promise<boolean> {
    const [rows] = await db.execute(
      `SELECT 1 FROM favorite_materials WHERE user_id = ? AND material_id = ?`,
      [userId, materialId]
    );
    return (rows as any[]).length > 0;
  }
}

export default FavoriteMaterialModel;
export type { FavoriteMaterial, MaterialWithCategory };
