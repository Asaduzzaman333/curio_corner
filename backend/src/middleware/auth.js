import jwt from "jsonwebtoken";
import { AdminUser } from "../models/AdminUser.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protectAdmin = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminUser.findById(decoded.id).select("-passwordHash");
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid admin session" });
    }
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
});
