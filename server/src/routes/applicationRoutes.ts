import { Router } from "express";
import { getAllApplications } from "../controllers/applicationController";

const router = Router();

router.get("/", getAllApplications);

export default router;
