import { Request, Response } from "express";
import { StorageModel, Storage, StorageInput } from "../models/storageModel";

export const createStorage = async (req: Request, res: Response) => {
  try {
    const { name, location } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const storageData: StorageInput = {
      name,
      location: location || null,
    };

    const id = await StorageModel.create(storageData);
    const createdStorage = await StorageModel.findById(id);

    return res.status(201).json(createdStorage);
  } catch (error) {
    console.error("Error creating storage:", error);
    return res.status(500).json({ error: "Failed to create storage" });
  }
};

export const getStorages = async (req: Request, res: Response) => {
  try {
    const storages = await StorageModel.findAll();
    res.json(storages);
  } catch (error) {
    console.error("Error fetching storages:", error);
    res.status(500).json({ error: "Failed to fetch storages" });
  }
};

export const getStorageById = async (req: Request, res: Response) => {
  try {
    const storage = await StorageModel.findById(Number(req.params.id));
    if (!storage) {
      return res.status(404).json({ error: "Storage not found" });
    }
    res.json(storage);
  } catch (error) {
    console.error("Error fetching storage:", error);
    res.status(500).json({ error: "Failed to fetch storage" });
  }
};

export const updateStorage = async (req: Request, res: Response) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "No data to update" });
    }

    const success = await StorageModel.update(Number(req.params.id), req.body);
    if (!success) {
      return res.status(404).json({ error: "Storage not found" });
    }

    const updatedStorage = await StorageModel.findById(Number(req.params.id));
    res.json(updatedStorage);
  } catch (error) {
    console.error("Error updating storage:", error);
    res.status(500).json({ error: "Failed to update storage" });
  }
};

export const deleteStorage = async (req: Request, res: Response) => {
  try {
    const success = await StorageModel.delete(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Storage not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting storage:", error);
    res.status(500).json({ error: "Failed to delete storage" });
  }
};
