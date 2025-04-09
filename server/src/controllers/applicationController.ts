import { Request, Response } from "express";
import { db } from "../services/db";

export const getAllApplications = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM applications");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получении заявок" });
  }
};
