import db from "../config/db";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";

interface Storage extends RowDataPacket {
  id: number;
  name: string;
  location: string | null;
}

interface StorageInput {
  name: string;
  location?: string;
}

class StorageModel {
  static async create(storage: StorageInput): Promise<number> {
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO storages (name, location) VALUES (?, ?)",
      [storage.name, storage.location || null]
    );
    return result.insertId;
  }

  static async findAll(): Promise<Storage[]> {
    const [rows] = await db.query<Storage[]>("SELECT * FROM storages");
    return rows;
  }

  static async findById(id: number): Promise<Storage | null> {
    const [rows] = await db.query<Storage[]>(
      "SELECT * FROM storages WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }

  static async update(
    id: number,
    storage: Partial<StorageInput>
  ): Promise<boolean> {
    const fieldsToUpdate = Object.keys(storage).filter(
      (key) => storage[key as keyof StorageInput] !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields to update");
    }

    const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");

    const values: (string | null | number)[] = fieldsToUpdate.map(
      (field) => storage[field as keyof StorageInput] ?? null
    );
    values.push(id);

    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE storages SET ${setClause} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM storages WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

export { Storage, StorageInput, StorageModel };
