import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Токен авторизации отсутствует" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    (req as any).user = typeof decoded === "object" ? decoded : { id: decoded };
    next();
  } catch (error) {
    console.error("Ошибка верификации токена:", error);
    res.status(401).json({ error: "Недействительный токен" });
  }
};

export default authMiddleware;
