import express from "express";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { protectAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const categoryRoutes = express.Router();

const defaults = ["Handmade Cards", "Gift Boxes", "Handmade Art", "Craft Items", "Customized Gifts"];

const ensureDefaultCategories = async () => {
  const count = await Category.countDocuments();
  if (count > 0) return;
  await Category.insertMany(defaults.map((name, index) => ({ name, order: index + 1 })), { ordered: false });
};

const normalizeName = (name) => String(name || "").trim();

categoryRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    await ensureDefaultCategories();
    const categories = await Category.find({ isEnabled: true }).sort({ order: 1, name: 1 });
    res.json({ items: categories.map((category) => category.name) });
  })
);

categoryRoutes.get(
  "/admin/all",
  protectAdmin,
  asyncHandler(async (req, res) => {
    await ensureDefaultCategories();
    const items = await Category.find({}).sort({ order: 1, name: 1 });
    res.json({ items });
  })
);

categoryRoutes.post(
  "/",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const name = normalizeName(req.body.name);
    if (!name) return res.status(400).json({ message: "Category name is required" });
    const existing = await Category.findOne({ name });
    if (existing) return res.status(409).json({ message: "Category already exists" });

    const last = await Category.findOne({}).sort({ order: -1 });
    const category = await Category.create({
      name,
      order: Number(req.body.order || last?.order + 1 || 1),
      isEnabled: req.body.isEnabled ?? true
    });

    await ActivityLog.create({ actor: req.admin.email, action: "create", entity: "Category", entityId: category._id });
    res.status(201).json(category);
  })
);

categoryRoutes.put(
  "/:id",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const current = await Category.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Category not found" });

    const nextName = normalizeName(req.body.name || current.name);
    if (!nextName) return res.status(400).json({ message: "Category name is required" });
    const existing = await Category.findOne({ name: nextName, _id: { $ne: current._id } });
    if (existing) return res.status(409).json({ message: "Category already exists" });

    const oldName = current.name;
    current.name = nextName;
    if (req.body.order !== undefined) current.order = Number(req.body.order);
    if (req.body.isEnabled !== undefined) current.isEnabled = Boolean(req.body.isEnabled);
    await current.save();

    if (oldName !== current.name) {
      await Product.updateMany({ category: oldName }, { $set: { category: current.name } });
    }

    await ActivityLog.create({ actor: req.admin.email, action: "update", entity: "Category", entityId: current._id });
    res.json(current);
  })
);

categoryRoutes.delete(
  "/:id",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(409).json({ message: "This category is used by products. Move or edit those products first." });
    }

    await category.deleteOne();
    await ActivityLog.create({ actor: req.admin.email, action: "delete", entity: "Category", entityId: category._id });
    res.json({ message: "Category deleted" });
  })
);
