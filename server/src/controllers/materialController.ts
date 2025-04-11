import { Request, Response } from "express";
import { MaterialModel, MaterialInput } from "../models/materialModel";

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const materialData: MaterialInput = req.body;
    const id = await MaterialModel.create(materialData);
    res.status(201).json({ id, ...materialData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при создании материала" });
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

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const success = await MaterialModel.update(Number(req.params.id), req.body);
    if (!success) {
      return res.status(404).json({ error: "Материал не найден" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при обновлении материала" });
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
