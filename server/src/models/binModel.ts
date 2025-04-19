import db from "../config/db";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";

interface Bin extends RowDataPacket {
  id: number;
  storage_id: number;
  name: string;
  storage_name?: string; // если тянем JOIN'ом
}

interface BinInput {
  storage_id: number;
  name: string;
}

class BinModel {
  // 🔹 Проверка: существует ли склад
  static async storageExists(storageId: number): Promise<boolean> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM storages WHERE id = ?",
      [storageId]
    );
    return rows.length > 0;
  }

  // 🔹 Проверка: имя уникально в пределах склада
  static async isNameUniqueInStorage(
    storageId: number,
    name: string
  ): Promise<boolean> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM bins WHERE storage_id = ? AND name = ?",
      [storageId, name]
    );
    return rows.length === 0;
  }

  static async create(bin: BinInput): Promise<number> {
    // Проверки
    const storageExists = await this.storageExists(bin.storage_id);
    if (!storageExists) {
      throw new Error("Storage not found");
    }

    const isUnique = await this.isNameUniqueInStorage(bin.storage_id, bin.name);
    if (!isUnique) {
      throw new Error("Bin name must be unique within the storage");
    }

    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO bins (storage_id, name) VALUES (?, ?)",
      [bin.storage_id, bin.name]
    );
    return result.insertId;
  }

  // 🔹 JOIN со складами
  static async findAll(): Promise<Bin[]> {
    const [rows] = await db.query<Bin[]>(
      `SELECT bins.*, storages.name AS storage_name
       FROM bins
       JOIN storages ON bins.storage_id = storages.id`
    );
    return rows;
  }

  static async findById(id: number): Promise<Bin | null> {
    const [rows] = await db.query<Bin[]>(
      `SELECT bins.*, storages.name AS storage_name
       FROM bins
       JOIN storages ON bins.storage_id = storages.id
       WHERE bins.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByStorageId(storageId: number): Promise<Bin[]> {
    const [rows] = await db.query<Bin[]>(
      `SELECT bins.*, storages.name AS storage_name
       FROM bins
       JOIN storages ON bins.storage_id = storages.id
       WHERE bins.storage_id = ?`,
      [storageId]
    );
    return rows;
  }

  static async update(id: number, bin: Partial<BinInput>): Promise<boolean> {
    const fieldsToUpdate = Object.keys(bin).filter(
      (key) => bin[key as keyof BinInput] !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields to update");
    }

    const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
    const values: (string | number | null)[] = fieldsToUpdate.map(
      (field) => bin[field as keyof BinInput] ?? null
    );
    values.push(id);

    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE bins SET ${setClause} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM bins WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

export { Bin, BinInput, BinModel };
