import { Request, Response } from "express";
import { BinModel, Bin, BinInput } from "../models/binModel";

export const createBin = async (req: Request, res: Response) => {
  try {
    const { name, location } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const binData: BinInput = {
      name,
      location: location || null,
    };

    const id = await BinModel.create(binData);
    const createdBin = await BinModel.findById(id);

    return res.status(201).json(createdBin);
  } catch (error) {
    console.error("Error creating bin:", error);
    return res.status(500).json({ error: "Failed to create bin" });
  }
};

export const getBins = async (req: Request, res: Response) => {
  try {
    const bins = await BinModel.findAll();
    res.json(bins);
  } catch (error) {
    console.error("Error fetching bins:", error);
    res.status(500).json({ error: "Failed to fetch bins" });
  }
};

export const getBinById = async (req: Request, res: Response) => {
  try {
    const bin = await BinModel.findById(Number(req.params.id));
    if (!bin) {
      return res.status(404).json({ error: "Bin not found" });
    }
    res.json(bin);
  } catch (error) {
    console.error("Error fetching bin:", error);
    res.status(500).json({ error: "Failed to fetch bin" });
  }
};

export const updateBin = async (req: Request, res: Response) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "No data to update" });
    }

    const success = await BinModel.update(Number(req.params.id), req.body);
    if (!success) {
      return res.status(404).json({ error: "Bin not found" });
    }

    const updatedBin = await BinModel.findById(Number(req.params.id));
    res.json(updatedBin);
  } catch (error) {
    console.error("Error updating bin:", error);
    res.status(500).json({ error: "Failed to update bin" });
  }
};

export const deleteBin = async (req: Request, res: Response) => {
  try {
    const success = await BinModel.delete(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Bin not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting bin:", error);
    res.status(500).json({ error: "Failed to delete bin" });
  }
};
