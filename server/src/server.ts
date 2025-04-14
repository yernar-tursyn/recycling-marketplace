/// <reference path="../types/express.d.ts" />
import dotenv from "dotenv";
import path from "path";

// 1. Первым делом загружаем конфиг из .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 2. Проверяем загрузку переменных (для отладки)
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);

// 3. Импортируем остальные модули
import app from "./app";
import db from "./config/db";

const PORT = process.env.PORT || 3000;

async function testConnection() {
  try {
    const [rows] = await db.execute("SELECT 1");
    console.log("✅ Database connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

async function startServer() {
  const isDbConnected = await testConnection();

  if (!isDbConnected) {
    console.error("Cannot start server without database connection");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  });
}

startServer();
