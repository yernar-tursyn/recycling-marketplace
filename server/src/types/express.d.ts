import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      role: string;
    } & JwtPayload;
  }
}

interface UserPayload {
  id: number;
  // Дополнительные поля, если нужно (но лучше минимизировать)
}

export {}; // Важно для модульной системы
