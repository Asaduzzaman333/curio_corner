import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import { authRoutes } from "./routes/authRoutes.js";
import { productRoutes } from "./routes/productRoutes.js";
import { orderRoutes } from "./routes/orderRoutes.js";
import { settingsRoutes } from "./routes/settingsRoutes.js";
import { mediaRoutes } from "./routes/mediaRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { categoryRoutes } from "./routes/categoryRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();

const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean);

app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked"));
    },
    credentials: true
  })
);

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (req, res) => res.json({ ok: true, service: "mahin-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/categories", categoryRoutes);

app.use(notFound);
app.use(errorHandler);
