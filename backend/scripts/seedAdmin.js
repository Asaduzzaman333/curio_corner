import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/config/db.js";
import { AdminUser } from "../src/models/AdminUser.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name: "Admin", email: email.toLowerCase(), passwordHash, role: "owner", isActive: true },
    { upsert: true, new: true }
  );

  console.log(`Admin ready: ${email}`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
