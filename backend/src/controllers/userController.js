import { query } from "../config/db.js";
import { publicUser } from "../utils/auth.js";

export async function updateMe(req, res, next) {
  try {
    const { name, phone, bio, location } = req.body;
    await query(
      "UPDATE users SET name = :name, phone = :phone, bio = :bio, location = :location WHERE id = :id",
      { id: req.user.id, name, phone, bio, location }
    );
    const users = await query(
      "SELECT id, name, email, role, phone, specialization, bio, location FROM users WHERE id = :id",
      { id: req.user.id }
    );
    res.json({ user: publicUser(users[0]) });
  } catch (error) {
    next(error);
  }
}
