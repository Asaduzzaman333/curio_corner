import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";

const port = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  connectDB()
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
  await connectDB();
  return app(req, res);
}
