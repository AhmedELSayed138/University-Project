import { Router } from "express";
import { createSlot, deleteSlot, listSlots } from "../controllers/slotController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, listSlots);
router.post("/", protect, restrictTo("admin"), createSlot);
router.delete("/:id", protect, restrictTo("admin"), deleteSlot);

export default router;
