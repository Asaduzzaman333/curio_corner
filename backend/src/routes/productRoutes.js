import express from "express";
import { Product } from "../models/Product.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { protectAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { productQuerySchema, productSchema, productUpdateSchema } from "../validators/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const productRoutes = express.Router();

const publicFilter = { isPublished: true, isEnabled: true };

productRoutes.get(
  "/",
  validate(productQuerySchema),
  asyncHandler(async (req, res) => {
    const { search, category, featured, trending, limit = 24, page = 1 } = req.query;
    const filter = req.admin ? {} : { ...publicFilter };

    if (category) filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (trending === "true") filter.isTrending = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Product.find(filter).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  })
);

productRoutes.get(
  "/admin/all",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const items = await Product.find({}).sort({ createdAt: -1 });
    res.json({ items });
  })
);

productRoutes.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug, ...publicFilter });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  })
);

productRoutes.post(
  "/",
  protectAdmin,
  validate(productSchema),
  asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    await ActivityLog.create({ actor: req.admin.email, action: "create", entity: "Product", entityId: product._id });
    res.status(201).json(product);
  })
);

productRoutes.put(
  "/:id",
  protectAdmin,
  validate(productUpdateSchema),
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    await ActivityLog.create({ actor: req.admin.email, action: "update", entity: "Product", entityId: product._id });
    res.json(product);
  })
);

productRoutes.delete(
  "/:id",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await ActivityLog.create({ actor: req.admin.email, action: "delete", entity: "Product", entityId: product._id });
    res.json({ message: "Product deleted" });
  })
);
