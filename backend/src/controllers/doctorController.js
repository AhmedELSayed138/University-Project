import { query } from "../config/db.js";

export async function listDoctors(req, res, next) {
  try {
    const search = `%${req.query.search || ""}%`;
    const specialization = req.query.specialization || "";
    const doctors = await query(
      `SELECT
         u.id, u.name, u.email, u.phone, u.specialization, u.bio, u.location, u.status,
         COUNT(CASE WHEN s.status = 'available' AND s.start_time >= NOW() THEN 1 END) AS available_slots
       FROM users u
       LEFT JOIN slots s ON s.doctor_id = u.id
       WHERE u.role = 'doctor'
         AND u.status = 'active'
         AND (u.name LIKE :search OR u.specialization LIKE :search)
         AND (:specialization = '' OR u.specialization = :specialization)
       GROUP BY u.id
       ORDER BY u.name`,
      { search, specialization }
    );
    res.json({ doctors });
  } catch (error) {
    next(error);
  }
}

export async function getDoctor(req, res, next) {
  try {
    const doctors = await query(
      `SELECT id, name, email, phone, specialization, bio, location, status
       FROM users WHERE id = :id AND role = 'doctor'`,
      { id: req.params.id }
    );

    if (!doctors.length) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ doctor: doctors[0] });
  } catch (error) {
    next(error);
  }
}

export async function createDoctor(req, res, next) {
  try {
    const { name, email, password, phone, specialization, bio, location } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ message: "Name, email, password and specialization are required" });
    }

    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.default.hash(password, 12);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, specialization, bio, location)
       VALUES (:name, :email, :passwordHash, 'doctor', :phone, :specialization, :bio, :location)`,
      { name, email, passwordHash, phone, specialization, bio, location }
    );

    const doctors = await query(
      "SELECT id, name, email, phone, specialization, bio, location, status FROM users WHERE id = :id",
      { id: result.insertId }
    );
    res.status(201).json({ doctor: doctors[0] });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }
    next(error);
  }
}

export async function updateDoctor(req, res, next) {
  try {
    const { name, email, phone, specialization, bio, location, status } = req.body;
    await query(
      `UPDATE users
       SET name = :name, email = :email, phone = :phone, specialization = :specialization,
           bio = :bio, location = :location, status = :status
       WHERE id = :id AND role = 'doctor'`,
      { id: req.params.id, name, email, phone, specialization, bio, location, status }
    );
    const doctors = await query(
      "SELECT id, name, email, phone, specialization, bio, location, status FROM users WHERE id = :id",
      { id: req.params.id }
    );
    res.json({ doctor: doctors[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteDoctor(req, res, next) {
  try {
    await query("UPDATE users SET status = 'inactive' WHERE id = :id AND role = 'doctor'", { id: req.params.id });
    res.json({ message: "Doctor deactivated" });
  } catch (error) {
    next(error);
  }
}
