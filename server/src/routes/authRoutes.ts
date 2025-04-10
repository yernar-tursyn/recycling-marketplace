import { Router } from "express";
import { register, login, getProfile } from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

// Регистрация покупателя
router.post("/register", register);

// Аутентификация покупателя
router.post("/login", login);

// Получение информации о профиле
// router.get("/profile", authMiddleware, getProfile);

export default router;
