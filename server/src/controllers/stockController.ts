import { Request, Response } from "express";
import { StockModel, Stock, StockInput } from "../models/stockModel";

export const createStock = async (req: Request, res: Response) => {
  try {
    const { material_id, bin_id, quantity, seller_id } = req.body;

    if (!material_id || !bin_id || !quantity || !seller_id) {
      return res.status(400).json({
        error:
          "All fields are required (material_id, bin_id, quantity, seller_id)",
      });
    }

    const stockData: StockInput = {
      material_id: Number(material_id),
      bin_id: Number(bin_id), // Изменено на bin_id
      quantity: Number(quantity),
      seller_id: Number(seller_id),
    };

    const id = await StockModel.create(stockData);
    const createdStock = await StockModel.findById(id);

    return res.status(201).json(createdStock);
  } catch (error) {
    console.error("Error creating stock:", error);
    return res.status(500).json({ error: "Failed to create stock" });
  }
};

export const getStocks = async (req: Request, res: Response) => {
  try {
    const stocks = await StockModel.findAll();
    res.json(stocks);
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
};

export const getStockById = async (req: Request, res: Response) => {
  try {
    const stock = await StockModel.findById(Number(req.params.id));
    if (!stock) {
      return res.status(404).json({ error: "Stock not found" });
    }
    res.json(stock);
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({ error: "Failed to fetch stock" });
  }
};

export const getStocksByMaterial = async (req: Request, res: Response) => {
  try {
    const stocks = await StockModel.findByMaterial(
      Number(req.params.material_id)
    );
    res.json(stocks);
  } catch (error) {
    console.error("Error fetching stocks by material:", error);
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
};

export const getStocksByBin = async (req: Request, res: Response) => {
  try {
    const stocks = await StockModel.findByBin(Number(req.params.bin_id)); // Заменено на bin_id
    res.json(stocks);
  } catch (error) {
    console.error("Error fetching stocks by bin:", error);
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "No data to update" });
    }

    const success = await StockModel.update(Number(req.params.id), req.body);
    if (!success) {
      return res.status(404).json({ error: "Stock not found" });
    }

    const updatedStock = await StockModel.findById(Number(req.params.id));
    res.json(updatedStock);
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: "Failed to update stock" });
  }
};

export const deleteStock = async (req: Request, res: Response) => {
  try {
    const success = await StockModel.delete(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Stock not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting stock:", error);
    res.status(500).json({ error: "Failed to delete stock" });
  }
};
