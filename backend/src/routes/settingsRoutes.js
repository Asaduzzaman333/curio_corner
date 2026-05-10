import express from "express";
import { SiteSettings } from "../models/SiteSettings.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { protectAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { settingsSchema } from "../validators/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const settingsRoutes = express.Router();

const getSettings = () => SiteSettings.findOneAndUpdate({ key: "main" }, { $setOnInsert: { key: "main" } }, { new: true, upsert: true });

settingsRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await getSettings());
  })
);

settingsRoutes.put(
  "/",
  protectAdmin,
  validate(settingsSchema),
  asyncHandler(async (req, res) => {
    const settings = await SiteSettings.findOneAndUpdate({ key: "main" }, req.body, { new: true, upsert: true, runValidators: true });
    await ActivityLog.create({ actor: req.admin.email, action: "update", entity: "SiteSettings", entityId: settings._id });
    res.json(settings);
  })
);
