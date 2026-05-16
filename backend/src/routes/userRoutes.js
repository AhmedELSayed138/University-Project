import { Router } from "express";
import { updateMe } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.put("/me", protect, updateMe);

export default router;
