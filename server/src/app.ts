import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import { Request, Response, NextFunction } from "express";

// Импортируем маршруты для материалов
import materialRoutes from "./routes/materialRoutes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Ограничение количества запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // лимит 100 запросов с одного IP
});
app.use(limiter);

// Маршруты
app.use("/api/users", authRoutes);
app.use("/api/materials", materialRoutes);

// Обработка ошибок
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

export default app;
