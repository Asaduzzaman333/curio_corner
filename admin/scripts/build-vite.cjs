const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const viteEntry = require.resolve("vite", { paths: [process.cwd(), __dirname] });
let dir = path.dirname(viteEntry);
while (dir !== path.dirname(dir)) {
  const pkgPath = path.join(dir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (pkg.name === "vite") break;
  }
  dir = path.dirname(dir);
}
const viteBin = path.join(dir, "bin", "vite.js");
const result = spawnSync(process.execPath, [viteBin, "build"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: process.env
});

process.exit(result.status ?? 1);
