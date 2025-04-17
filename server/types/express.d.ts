import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserPayload;
  }
}

interface UserPayload {
  id: number;
  userType: "buyer" | "seller" | "manager" | "admin";
}

export {}; // Не удаляй — нужно для модулей
