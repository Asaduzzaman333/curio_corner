const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const adminDist = path.join(root, "admin", "dist");
const target = path.join(root, "frontend", "dist", "admin");

if (!fs.existsSync(adminDist)) {
  throw new Error(`Admin build output not found: ${adminDist}`);
}

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(adminDist, target, { recursive: true });
console.log(`Admin app copied to ${target}`);
