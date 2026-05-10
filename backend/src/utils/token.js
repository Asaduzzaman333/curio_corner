import jwt from "jsonwebtoken";

export const signToken = (admin) =>
  jwt.sign(
    { id: admin._id, role: admin.role, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "365d" }
  );
