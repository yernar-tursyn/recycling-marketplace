import { Request, Response } from "express";
import UserModel, { UserInput } from "../models/userModel";
import { generateToken, comparePasswords } from "../utils/passwordUtils";
import { registerValidator, validate } from "../validators/authValidator";

interface AuthenticatedRequest extends Request {
  user?: UserPayload; // Теперь user будет иметь тип UserPayload
}

interface UserPayload {
  id: number;
  userType: "buyer" | "seller" | "manager" | "admin";
}

// Регистрация пользователя
export const register = [
  ...registerValidator,
  validate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password, name, userType } = req.body as UserInput;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Пользователь с таким email уже существует" });
      }

      const userId = await UserModel.create({
        email,
        password,
        name,
        userType,
      });
      const user = await UserModel.findById(userId);

      if (!user) {
        return res
          .status(500)
          .json({ error: "Ошибка при создании пользователя" });
      }

      return res.status(201).json(user);
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      return res.status(500).json({ error: "Ошибка сервера при регистрации" });
    }
  },
];

// Вход пользователя
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const token = generateToken(user.id);

    return res.json({
      token,
    });
  } catch (error) {
    console.error("Ошибка при входе:", error);
    return res.status(500).json({ error: "Ошибка сервера при входе" });
  }
};

// Получение профиля пользователя
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Проверка авторизации
    if (!req.user?.id) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    // Получение пользователя из БД
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Форматируем ответ согласно спецификации
    const responseData = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType, // Добавили userType
    };

    return res.json(responseData);
  } catch (error) {
    console.error("Ошибка при получении профиля:", error);
    return res.status(500).json({
      error: "Ошибка сервера при получении профиля",
    });
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    await UserModel.delete(userId);
    return res.status(204).send();
  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error);
    return res
      .status(500)
      .json({ error: "Ошибка сервера при удалении пользователя" });
  }
};

export const deleteUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Некорректный ID пользователя" });
    }

    if (userId === req.user?.id) {
      return res.status(403).json({ error: "Нельзя удалить самого себя" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    await UserModel.delete(userId);
    return res.status(204).send();
  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error);
    return res
      .status(500)
      .json({ error: "Ошибка сервера при удалении пользователя" });
  }
};
