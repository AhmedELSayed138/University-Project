import { query } from "../config/db.js";

export async function getStats(req, res, next) {
  try {
    const [doctorStats] = await query("SELECT COUNT(*) AS totalDoctors FROM users WHERE role = 'doctor' AND status = 'active'");
    const [patientStats] = await query("SELECT COUNT(*) AS totalPatients FROM users WHERE role = 'patient'");
    const [slotStats] = await query("SELECT COUNT(*) AS availableSlots FROM slots WHERE status = 'available' AND start_time >= NOW()");
    const [appointmentStats] = await query(
      `SELECT
         COUNT(*) AS totalAppointments,
         SUM(status = 'scheduled') AS scheduled,
         SUM(status = 'completed') AS completed,
         SUM(status = 'cancelled') AS cancelled
       FROM appointments`
    );
    const recent = await query(
      `SELECT a.id, p.name AS patient_name, d.name AS doctor_name, a.status, a.created_at
       FROM appointments a
       JOIN users p ON p.id = a.patient_id
       JOIN users d ON d.id = a.doctor_id
       ORDER BY a.created_at DESC
       LIMIT 5`
    );

    res.json({
      stats: {
        totalDoctors: doctorStats.totalDoctors,
        totalPatients: patientStats.totalPatients,
        availableSlots: slotStats.availableSlots,
        totalAppointments: appointmentStats.totalAppointments || 0,
        scheduled: appointmentStats.scheduled || 0,
        completed: appointmentStats.completed || 0,
        cancelled: appointmentStats.cancelled || 0
      },
      recent
    });
  } catch (error) {
    next(error);
  }
}
