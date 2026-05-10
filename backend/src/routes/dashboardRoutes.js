import express from "express";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { protectAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardRoutes = express.Router();

dashboardRoutes.get(
  "/",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const [totalProducts, totalOrders, revenueRows, recentOrders, productsByCategory, activity] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$subtotal" } } }]),
      Order.find({}).sort({ createdAt: -1 }).limit(6),
      Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      ActivityLog.find({}).sort({ createdAt: -1 }).limit(8)
    ]);

    res.json({
      totalProducts,
      totalOrders,
      revenue: revenueRows[0]?.total || 0,
      recentOrders,
      productsByCategory,
      activity
    });
  })
);
