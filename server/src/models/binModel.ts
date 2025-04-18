import db from "../config/db";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";

interface Bin extends RowDataPacket {
  id: number;
  name: string;
  location: string | null;
}

interface BinInput {
  name: string;
  location?: string;
}

class BinModel {
  static async create(bin: BinInput): Promise<number> {
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO bins (name, location) VALUES (?, ?)",
      [bin.name, bin.location || null]
    );
    return result.insertId;
  }

  static async findAll(): Promise<Bin[]> {
    const [rows] = await db.query<Bin[]>("SELECT * FROM bins");
    return rows;
  }

  static async findById(id: number): Promise<Bin | null> {
    const [rows] = await db.query<Bin[]>("SELECT * FROM bins WHERE id = ?", [
      id,
    ]);
    return rows[0] || null;
  }

  static async update(id: number, bin: Partial<BinInput>): Promise<boolean> {
    const fieldsToUpdate = Object.keys(bin).filter(
      (key) => bin[key as keyof BinInput] !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields to update");
    }

    const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");

    const values: (string | null | number)[] = fieldsToUpdate.map(
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
