import express from "express";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const categoryRoutes = express.Router();

const defaults = ["Handmade Cards", "Gift Boxes", "Handmade Art", "Craft Items", "Customized Gifts"];

categoryRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    const productCategories = await Product.distinct("category", { isPublished: true, isEnabled: true });
    res.json({ items: Array.from(new Set([...defaults, ...productCategories])) });
  })
);
