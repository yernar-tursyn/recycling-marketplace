import { Request, Response } from "express";
import { BinModel } from "../models/binModel";

class BinController {
  // 🔹 Получить все ячейки (с JOIN на склады)
  static async getAll(req: Request, res: Response) {
    try {
      const bins = await BinModel.findAll();
      res.json(bins);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve bins" });
    }
  }

  // 🔹 Получить по ID
  static async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const bin = await BinModel.findById(id);
      if (!bin) return res.status(404).json({ error: "Bin not found" });
      res.json(bin);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve bin" });
    }
  }

  // 🔹 Получить все ячейки по складу
  static async getByStorageId(req: Request, res: Response) {
    try {
      const storageId = Number(req.params.storageId);
      const bins = await BinModel.findByStorageId(storageId);
      res.json(bins);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve bins for storage" });
    }
  }

  // 🔹 Создание новой ячейки
  static async create(req: Request, res: Response) {
    try {
      const { storage_id, name } = req.body;

      if (!storage_id || !name) {
        return res
          .status(400)
          .json({ error: "storage_id and name are required" });
      }

      const newId = await BinModel.create({ storage_id, name });
      res.status(201).json({ id: newId });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create bin" });
    }
  }

  // 🔹 Обновление
  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updated = await BinModel.update(id, req.body);
      if (!updated) return res.status(404).json({ error: "Bin not found" });
      res.json({ message: "Bin updated successfully" });
    } catch (error) {
      res.status(400).json({ error: "Failed to update bin" });
    }
  }

  // 🔹 Удаление
  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const deleted = await BinModel.delete(id);
      if (!deleted) return res.status(404).json({ error: "Bin not found" });
      res.json({ message: "Bin deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bin" });
    }
  }
}

export default BinController;
