import { Router } from "express";
import { createCron, listCrons, updateCron, deleteCron } from "../controllers/cronController";

const router = Router();
router.post("/", createCron);
router.get("/", listCrons);
router.put("/:id", updateCron);
router.delete("/:id", deleteCron);

export default router;
