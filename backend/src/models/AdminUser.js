import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["owner", "manager"], default: "owner" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date
  },
  { timestamps: true }
);

adminUserSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const AdminUser = mongoose.model("AdminUser", adminUserSchema);
