import mysql from "mysql2/promise";

interface DatabaseConfig {
  host: string;
  port: number; // Добавлено явное указание порта
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
  ssl: { rejectUnauthorized: boolean };
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306, // Преобразуем строку в число
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "recycle",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = mysql.createPool(config);

export default pool;
