import { query } from "../config/db.js";

export async function listSlots(req, res, next) {
  try {
    const { doctorId = "", date = "" } = req.query;
    const slots = await query(
      `SELECT s.id, s.doctor_id, u.name AS doctor_name, s.start_time, s.end_time, s.status
       FROM slots s
       JOIN users u ON u.id = s.doctor_id
       WHERE (:doctorId = '' OR s.doctor_id = :doctorId)
         AND (:date = '' OR DATE(s.start_time) = :date)
       ORDER BY s.start_time`,
      { doctorId, date }
    );
    res.json({ slots });
  } catch (error) {
    next(error);
  }
}

export async function createSlot(req, res, next) {
  try {
    const { doctorId, startTime, endTime } = req.body;

    if (!doctorId || !startTime || !endTime) {
      return res.status(400).json({ message: "doctorId, startTime and endTime are required" });
    }

    const result = await query(
      "INSERT INTO slots (doctor_id, start_time, end_time) VALUES (:doctorId, :startTime, :endTime)",
      { doctorId, startTime, endTime }
    );
    const slots = await query("SELECT * FROM slots WHERE id = :id", { id: result.insertId });
    res.status(201).json({ slot: slots[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteSlot(req, res, next) {
  try {
    const slots = await query("SELECT status FROM slots WHERE id = :id", { id: req.params.id });
    if (!slots.length) {
      return res.status(404).json({ message: "Slot not found" });
    }
    if (slots[0].status === "booked") {
      return res.status(400).json({ message: "Booked slots cannot be deleted" });
    }
    await query("DELETE FROM slots WHERE id = :id", { id: req.params.id });
    res.json({ message: "Slot deleted" });
  } catch (error) {
    next(error);
  }
}
