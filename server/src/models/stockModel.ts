import db from "../config/db";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";

// Интерфейс для записи в базе данных
interface Stock extends RowDataPacket {
  id: number;
  material_id: number;
  quantity: number;
  bin_id: number;
  seller_id: number;
  status: string;
  // Расширенные поля:
  material_name?: string;
  material_price?: number;
  storage_name?: string;
  storage_location?: string;
  seller_name?: string;
}
// Интерфейс для ввода данных (при создании)
interface StockInput {
  material_id: number;
  bin_id: number; // Заменено на bin_id
  quantity: number;
  seller_id: number;
}

class StockModel {
  // Создание новой записи
  static async create(stock: StockInput): Promise<number> {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO stocks 
       (material_id, bin_id, quantity, seller_id) 
       VALUES (?, ?, ?, ?)`, // Используем bin_id
      [stock.material_id, stock.bin_id, stock.quantity, stock.seller_id]
    );
    return result.insertId;
  }

  // Получение всех записей
  static async findAll(): Promise<Stock[]> {
    const [rows] = await db.query<Stock[]>("SELECT * FROM stocks");
    return rows;
  }

  // Получение записи по ID
  static async findById(id: number): Promise<Stock | null> {
    const [rows] = await db.query<Stock[]>(
      "SELECT * FROM stocks WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }

  // Получение записей по материалу (material_id)
  static async findByMaterial(material_id: number): Promise<Stock[]> {
    const [rows] = await db.query<Stock[]>(
      "SELECT * FROM stocks WHERE material_id = ?",
      [material_id]
    );
    return rows;
  }

  // Получение записей по ячейке (bin_id)
  static async findByBin(bin_id: number): Promise<Stock[]> {
    const [rows] = await db.query<Stock[]>(
      "SELECT * FROM stocks WHERE bin_id = ?",
      [bin_id]
    );
    return rows;
  }

  // Обновление записи
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

  // Удаление записи
  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM stocks WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  // Получение всех активных записей с количеством > 0
  static async findAvailable(): Promise<Stock[]> {
    const [rows] = await db.query<Stock[]>(
      `SELECT 
       s.*,
       m.name AS material_name,
       m.price AS material_price,
       st.name AS storage_name,
       st.location AS storage_location,
       u.name AS seller_name
     FROM stocks s
     JOIN materials m ON s.material_id = m.id
     JOIN bins b ON s.bin_id = b.id
     JOIN storages st ON b.storage_id = st.id
     JOIN users u ON s.seller_id = u.id
     WHERE s.quantity > 0 AND s.status = 'active'`
    );
    return rows;
  }

  static async findAvailableByMaterial(materialId: number): Promise<Stock[]> {
    const [rows] = await db.query<Stock[]>(
      `SELECT 
       s.*,
       m.name AS material_name,
       m.price AS material_price,
       st.name AS storage_name,
       st.location AS storage_location,
       u.name AS seller_name
     FROM stocks s
     JOIN materials m ON s.material_id = m.id
     JOIN bins b ON s.bin_id = b.id
     JOIN storages st ON b.storage_id = st.id
     JOIN users u ON s.seller_id = u.id
     WHERE s.quantity > 0 AND s.status = 'active' AND s.material_id = ?`,
      [materialId]
    );
    return rows;
  }
}

export { Stock, StockInput, StockModel };
