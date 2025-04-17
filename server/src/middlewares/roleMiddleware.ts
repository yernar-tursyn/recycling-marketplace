import { Request, Response, NextFunction } from "express";

const roleMiddleware = (
  allowedRoles: Array<"admin" | "manager" | "seller" | "buyer">
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Пользователь не аутентифицирован" });
    }

    const { userType } = req.user;

    if (!allowedRoles.includes(userType)) {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    next();
  };
};

export default roleMiddleware;
