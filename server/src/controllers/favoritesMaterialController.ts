import { Request, Response } from "express";
import FavoriteMaterialModel from "../models/favoriteMaterialModel";

/**
 * Получение всех избранных материалов пользователя
 */
export const getFavorites = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = Number(req.params.userId);
    const favorites = await FavoriteMaterialModel.getFavorites(userId);
    return res.json(favorites);
  } catch (error) {
    console.error("Ошибка при получении избранных материалов:", error);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при получении избранных материалов" });
  }
};

/**
 * Добавление материала в избранное
 */
export const addFavorite = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId, materialId } = req.body;

    // Добавляем материал в избранное
    await FavoriteMaterialModel.add(userId, materialId);

    return res.status(201).json({ message: "Материал добавлен в избранное" });
  } catch (error) {
    console.error("Ошибка при добавлении материала в избранное:", error);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при добавлении материала в избранное" });
  }
};

/**
 * Удаление материала из избранного
 */
export const removeFavorite = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId, materialId } = req.body;

    // Удаляем материал из избранного
    await FavoriteMaterialModel.remove(userId, materialId);

    return res.json({ message: "Материал удалён из избранного" });
  } catch (error) {
    console.error("Ошибка при удалении материала из избранного:", error);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при удалении материала из избранного" });
  }
};

/**
 * Проверка, является ли материал избранным
 */
export const checkFavorite = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = Number(req.params.userId);
    const materialId = Number(req.params.materialId);

    const isFavorite = await FavoriteMaterialModel.isFavorite(
      userId,
      materialId
    );
    return res.json({ isFavorite });
  } catch (error) {
    console.error("Ошибка при проверке избранного материала:", error);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при проверке избранного материала" });
  }
};
