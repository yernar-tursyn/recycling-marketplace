import db from "../config/db";
import { hashPassword } from "../utils/passwordUtils";
import mysql from "mysql2/promise";

interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

interface UserInput {
  email: string;
  password: string;
  name: string;
}

class UserModel {
  static async create(userData: UserInput): Promise<number> {
    const hashedPassword = await hashPassword(userData.password);
    const [result] = await db.execute(
      "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
      [userData.email, hashedPassword, userData.name, "buyer"]
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
      "SELECT id, email, name, role FROM users WHERE id = ?",
      [id]
    );
    return (rows as Omit<User, "password">[])[0] || null;
  }
}

export default UserModel;
export type { User, UserInput };
