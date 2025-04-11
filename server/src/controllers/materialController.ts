import { Request, Response } from "express";
import { MaterialModel, MaterialInput } from "../models/materialModel";
import { QueryError } from "mysql2";

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { name, category, price, quantity, location, seller_id } = req.body;

    if (!name || !category || !price || !quantity || !location || !seller_id) {
      return res.status(400).json({
        error: "Необходимо заполнить все обязательные поля",
      });
    }

    const materialData: MaterialInput = {
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
      location,
      seller_id: Number(seller_id),
      description: req.body.description || null,
      image_url: req.body.image_url || null,
      unit: req.body.unit || "kg",
    };

    const id = await MaterialModel.create(materialData);
    const createdMaterial = await MaterialModel.findById(id);

    return res.status(201).json(createdMaterial);
  } catch (error: unknown) {
    // Типизируем ошибку
    if (error instanceof Error) {
      console.error("Ошибка создания материала:", error.message);

      // Проверяем MySQL ошибки
      if (isQueryError(error)) {
        console.error("MySQL Error Code:", error.code);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
          return res.status(400).json({
            error: "Указанный продавец не существует",
            details:
              process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
          });
        }
      }

      return res.status(500).json({
        error: "Ошибка при создании материала",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    return res.status(500).json({
      error: "Неизвестная ошибка при создании материала",
    });
  }
};

export const searchMaterials = async (req: Request, res: Response) => {
  try {
    const { query, category, sort } = req.query;
    const materials = await MaterialModel.search(
      query as string,
      category as string,
      sort as string
    );
    res.json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при поиске материалов" });
  }
};

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const materials = await MaterialModel.findAll();
    res.json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при получении материалов" });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Нет данных для обновления" });
    }

    const success = await MaterialModel.update(Number(req.params.id), req.body);

    if (!success) {
      return res.status(404).json({ error: "Материал не найден" });
    }

    // Получаем обновлённый материал для ответа
    const updatedMaterial = await MaterialModel.findById(Number(req.params.id));
    res.json({
      success: true,
      message: "Материал успешно обновлён",
      material: updatedMaterial,
    });
  } catch (error) {
    console.error("Update material error:", error);

    if (error instanceof Error) {
      return res.status(400).json({
        error: "Ошибка при обновлении материала",
        details: error.message,
      });
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const success = await MaterialModel.delete(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Материал не найден" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при удалении материала" });
  }
};

export const getMaterialById = async (req: Request, res: Response) => {
  try {
    const material = await MaterialModel.findById(Number(req.params.id));
    if (!material) {
      return res.status(404).json({ error: "Материал не найден" });
    }
    res.json(material);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при получении материала" });
  }
};

// Вспомогательная функция для проверки типа MySQL ошибки
function isQueryError(error: unknown): error is QueryError {
  return typeof error === "object" && error !== null && "code" in error;
}
