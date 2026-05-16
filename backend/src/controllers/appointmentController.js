import { pool, query } from "../config/db.js";

const appointmentSelect = `
  SELECT a.id, a.patient_id, p.name AS patient_name, a.doctor_id, d.name AS doctor_name,
         d.specialization, a.slot_id, s.start_time, s.end_time, a.status, a.notes, a.created_at
  FROM appointments a
  JOIN users p ON p.id = a.patient_id
  JOIN users d ON d.id = a.doctor_id
  JOIN slots s ON s.id = a.slot_id
`;

export async function listAppointments(req, res, next) {
  try {
    const { status = "", doctorId = "", patientId = "" } = req.query;
    const params = { status, doctorId, patientId };
    const filters = [];

    if (req.user.role === "patient") {
      filters.push("a.patient_id = :currentUserId");
      params.currentUserId = req.user.id;
    }
    if (req.user.role === "doctor") {
      filters.push("a.doctor_id = :currentUserId");
      params.currentUserId = req.user.id;
    }
    if (status) filters.push("a.status = :status");
    if (doctorId) filters.push("a.doctor_id = :doctorId");
    if (patientId) filters.push("a.patient_id = :patientId");

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const appointments = await query(`${appointmentSelect} ${where} ORDER BY s.start_time DESC`, params);
    res.json({ appointments });
  } catch (error) {
    next(error);
  }
}

export async function bookAppointment(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { slotId, notes = "" } = req.body;

    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can book appointments" });
    }

    await connection.beginTransaction();
    const [slots] = await connection.execute(
      "SELECT * FROM slots WHERE id = ? AND status = 'available' FOR UPDATE",
      [slotId]
    );

    if (!slots.length) {
      await connection.rollback();
      return res.status(400).json({ message: "Slot is not available" });
    }

    const slot = slots[0];
    const [result] = await connection.execute(
      `INSERT INTO appointments (patient_id, doctor_id, slot_id, status, notes)
       VALUES (?, ?, ?, 'scheduled', ?)`,
      [req.user.id, slot.doctor_id, slot.id, notes]
    );
    await connection.execute("UPDATE slots SET status = 'booked' WHERE id = ?", [slot.id]);
    await connection.commit();

    const appointment = await query(`${appointmentSelect} WHERE a.id = :id`, { id: result.insertId });
    res.status(201).json({ appointment: appointment[0] });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

export async function updateAppointmentStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ["scheduled", "completed", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid appointment status" });
    }

    const appointments = await query("SELECT * FROM appointments WHERE id = :id", { id: req.params.id });
    const appointment = appointments[0];
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (req.user.role === "patient") {
      if (appointment.patient_id !== req.user.id) {
        return res.status(403).json({ message: "You can only update your own appointments" });
      }
      if (status !== "cancelled") {
        return res.status(403).json({ message: "Patients can only cancel appointments" });
      }
    }
    if (req.user.role === "doctor" && appointment.doctor_id !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own schedule" });
    }

    await query("UPDATE appointments SET status = :status WHERE id = :id", { status, id: req.params.id });
    if (status === "cancelled") {
      await query("UPDATE slots SET status = 'available' WHERE id = :slotId", { slotId: appointment.slot_id });
    }

    const updated = await query(`${appointmentSelect} WHERE a.id = :id`, { id: req.params.id });
    res.json({ appointment: updated[0] });
  } catch (error) {
    next(error);
  }
}
