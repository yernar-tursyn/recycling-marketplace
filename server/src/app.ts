import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import { Request, Response, NextFunction } from "express";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerOptions "; // путь зависит от твоей структуры проекта

// Импортируем маршруты для материалов
import materialRoutes from "./routes/materialRoutes";
// Импортируем маршруты для заказов
import orderRoutes from "./routes/orderRoutes"; // Добавляем маршруты для заказов
// Импортируем маршруты для уведомлений
import notificationRoutes from "./routes/notificationRoutes"; // Добавляем маршруты для уведомлений
import storageRoutes from "./routes/storageRoutes"; // Добавляем маршруты для хранения
const app = express();

//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/storage", storageRoutes);

// Обработка ошибок
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

export default app;
