import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await query(
      "SELECT id, name, email, role, phone, specialization, bio, location FROM users WHERE id = :id",
      { id: decoded.id }
    );

    if (!users.length) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = users[0];
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission for this action" });
    }
    next();
  };
}
