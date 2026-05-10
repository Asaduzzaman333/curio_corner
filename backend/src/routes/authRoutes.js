import express from "express";
import { AdminUser } from "../models/AdminUser.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { protectAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validators/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/token.js";

export const authRoutes = express.Router();

authRoutes.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const admin = await AdminUser.findOne({ email: email.toLowerCase(), isActive: true });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    admin.lastLoginAt = new Date();
    await admin.save();
    await ActivityLog.create({ actor: admin.email, action: "login", entity: "AdminUser", entityId: admin._id });

    res.json({
      token: signToken(admin),
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  })
);

authRoutes.get(
  "/me",
  protectAdmin,
  asyncHandler(async (req, res) => {
    res.json({ admin: req.admin });
  })
);
