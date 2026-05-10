import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
<<<<<<< HEAD
  base: "/admin/",
=======
>>>>>>> 4292013668882ef06c50bcc3180dcc50f830320d
  plugins: [react()],
  server: { port: 5174 },
  build: { sourcemap: false }
});
