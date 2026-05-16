import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { pool } from "../src/config/db.js";

dotenv.config();

async function main() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM appointments");
    await connection.query("DELETE FROM slots");
    await connection.query("DELETE FROM users");
    await connection.query("ALTER TABLE users AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE slots AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE appointments AUTO_INCREMENT = 1");

    const adminPassword = await bcrypt.hash("Admin@123", 12);
    const doctorPassword = await bcrypt.hash("Doctor@123", 12);
    const patientPassword = await bcrypt.hash("Patient@123", 12);

    const [admin] = await connection.execute(
      `INSERT INTO users (name, email, password_hash, role, phone, location)
       VALUES (?, ?, ?, 'admin', ?, ?)`,
      ["Clinic Admin", "admin@clinic.com", adminPassword, "+20 100 000 0001", "Cairo"]
    );

    const doctors = [
      ["Dr. Ahmed Hassan", "ahmed.doctor@clinic.com", doctorPassword, "+20 100 000 0002", "Cardiology", "Heart disease prevention, diagnosis and treatment.", "Cairo"],
      ["Dr. Sara El-Masry", "sara.doctor@clinic.com", doctorPassword, "+20 100 000 0003", "Dermatology", "Skin care, acne treatment and cosmetic dermatology.", "Giza"],
      ["Dr. Mohamed Farouk", "mohamed.doctor@clinic.com", doctorPassword, "+20 100 000 0004", "Neurology", "Migraines, movement disorders and neurological follow-up.", "Cairo"]
    ];

    const doctorIds = [];
    for (const doctor of doctors) {
      const [result] = await connection.execute(
        `INSERT INTO users (name, email, password_hash, role, phone, specialization, bio, location)
         VALUES (?, ?, ?, 'doctor', ?, ?, ?, ?)`,
        doctor
      );
      doctorIds.push(result.insertId);
    }

    const [patient] = await connection.execute(
      `INSERT INTO users (name, email, password_hash, role, phone, bio, location)
       VALUES (?, ?, ?, 'patient', ?, ?, ?)`,
      ["Ahmed Patient", "patient@clinic.com", patientPassword, "+20 100 000 0005", "Regular checkup patient.", "Cairo"]
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    for (const doctorId of doctorIds) {
      for (let i = 0; i < 5; i += 1) {
        const start = new Date(tomorrow.getTime() + i * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 45 * 60 * 1000);
        await connection.execute(
          "INSERT INTO slots (doctor_id, start_time, end_time) VALUES (?, ?, ?)",
          [doctorId, toMysqlDate(start), toMysqlDate(end)]
        );
      }
    }

    const [slotRows] = await connection.execute("SELECT * FROM slots WHERE doctor_id = ? LIMIT 1", [doctorIds[0]]);
    const firstSlot = slotRows[0];
    await connection.execute(
      `INSERT INTO appointments (patient_id, doctor_id, slot_id, status, notes)
       VALUES (?, ?, ?, 'scheduled', ?)`,
      [patient.insertId, firstSlot.doctor_id, firstSlot.id, "Seed appointment"]
    );
    await connection.execute("UPDATE slots SET status = 'booked' WHERE id = ?", [firstSlot.id]);

    await connection.commit();
    console.log(`Seed complete. Admin id: ${admin.insertId}`);
  } catch (error) {
    await connection.rollback();
    console.error(error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

function toMysqlDate(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

main();
