import { Router } from "express";
import { bookAppointment, listAppointments, updateAppointmentStatus } from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, listAppointments);
router.post("/", protect, bookAppointment);
router.patch("/:id/status", protect, updateAppointmentStatus);

export default router;
