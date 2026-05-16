import { Router } from "express";
import { createDoctor, deleteDoctor, getDoctor, listDoctors, updateDoctor } from "../controllers/doctorController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, listDoctors);
router.get("/:id", protect, getDoctor);
router.post("/", protect, restrictTo("admin"), createDoctor);
router.put("/:id", protect, restrictTo("admin"), updateDoctor);
router.delete("/:id", protect, restrictTo("admin"), deleteDoctor);

export default router;
