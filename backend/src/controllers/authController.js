import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { publicUser, signToken } from "../utils/auth.js";

export async function register(req, res, next) {
  try {
    const { name, email, password, phone = "" } = req.body;
    const role = "patient";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await query("SELECT id FROM users WHERE email = :email", { email });
    if (existing.length) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES (:name, :email, :passwordHash, :role, :phone)`,
      { name, email, passwordHash, role, phone }
    );

    const users = await query(
      "SELECT id, name, email, role, phone, specialization, bio, location FROM users WHERE id = :id",
      { id: result.insertId }
    );
    const user = users[0];

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const users = await query("SELECT * FROM users WHERE email = :email", { email });
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not a ${role}` });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}
