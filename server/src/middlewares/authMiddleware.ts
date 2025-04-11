import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Неверный формат авторизации" });
  }

  const token = authHeader.slice(7); // "Bearer ".length

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    // Типизированное присвоение
    req.user = { id: user.id }; // Только необходимые поля
    next();
  } catch (error) {
    const message =
      error instanceof jwt.TokenExpiredError
        ? "Токен истёк"
        : "Недействительный токен";
    return res.status(401).json({ error: message });
  }
};

export default authMiddleware;
