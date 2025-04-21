import db from "../config/db";
import { hashPassword } from "../utils/passwordUtils";
import mysql from "mysql2/promise";

// Полный интерфейс User
interface User {
  id: number;
  email: string;
  password: string;
  name: string | null;
  userType: "buyer" | "seller" | "manager" | "admin";
  created_at: Date;
  updated_at: Date;
}

// Интерфейс для создания пользователя
interface UserInput {
  email: string;
  password: string;
  name?: string;
  userType?: "buyer" | "seller" | "manager" | "admin";
}

class UserModel {
  static async create(userData: UserInput): Promise<number> {
    const hashedPassword = await hashPassword(userData.password);
    const [result] = await db.execute(
      `INSERT INTO users (email, password, name, userType)
       VALUES (?, ?, ?, ?)`,
      [
        userData.email,
        hashedPassword,
        userData.name || null,
        userData.userType || "buyer",
      ]
    );
    return (result as mysql.ResultSetHeader).insertId;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return (rows as User[])[0] || null;
  }

  static async findById(id: number): Promise<Omit<User, "password"> | null> {
    const [rows] = await db.execute(
      `SELECT id, email, name, userType, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );
    return (rows as Omit<User, "password">[])[0] || null;
  }

  static async updateName(id: number, newName: string): Promise<void> {
    await db.execute("UPDATE users SET name = ? WHERE id = ?", [newName, id]);
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);
    const affectedRows = (result as mysql.ResultSetHeader).affectedRows;
    return affectedRows > 0;
  }
}

export default UserModel;
export type { User, UserInput };
