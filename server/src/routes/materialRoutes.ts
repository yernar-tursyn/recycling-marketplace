import { Router } from "express";
import {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  searchMaterials,
} from "../controllers/materialController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createMaterial);
router.get("/", getMaterials);
router.get("/search", searchMaterials);
router.get("/:id", getMaterialById);
router.put("/:id", authMiddleware, updateMaterial);
router.delete("/:id", authMiddleware, deleteMaterial);

export default router;
