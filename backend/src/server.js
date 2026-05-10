import "dotenv/config";
import bcrypt from "bcryptjs";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { AdminUser } from "./models/AdminUser.js";

const port = process.env.PORT || 5000;
let adminBootstrapPromise;

const ensureDefaultAdmin = async () => {
  if (adminBootstrapPromise) return adminBootstrapPromise;

  adminBootstrapPromise = (async () => {
    const email = process.env.ADMIN_EMAIL?.toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;

    const existing = await AdminUser.findOne({ email });
    if (existing) return;

    const passwordHash = await bcrypt.hash(password, 12);
    await AdminUser.create({
      name: "Curio Corner Admin",
      email,
      passwordHash,
      role: "owner",
      isActive: true
    });
  })();

  return adminBootstrapPromise;
};

if (!process.env.VERCEL) {
  connectDB()
    .then(ensureDefaultAdmin)
    .then(() => {
      app.listen(port, () => {
        console.log(`API running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default async function handler(req, res) {
  try {
    await connectDB();
    await ensureDefaultAdmin();
    return app(req, res);
  } catch (error) {
    console.error("API startup failed", error);
    return res.status(500).json({
      message: "API startup failed",
      error: process.env.NODE_ENV === "production" ? "Check Vercel function logs and environment variables" : error.message
    });
  }
}
