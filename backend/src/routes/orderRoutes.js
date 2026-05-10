import express from "express";
import { Order } from "../models/Order.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { protectAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { orderSchema, orderStatusSchema } from "../validators/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const orderRoutes = express.Router();

orderRoutes.post(
  "/",
  validate(orderSchema),
  asyncHandler(async (req, res) => {
    const subtotal = req.body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ ...req.body, subtotal });
    res.status(201).json({ message: "Order placed", order });
  })
);

orderRoutes.get(
  "/",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate("items.product", "name slug");
    res.json({ items: orders });
  })
);

orderRoutes.patch(
  "/:id/status",
  protectAdmin,
  validate(orderStatusSchema),
  asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    await ActivityLog.create({ actor: req.admin.email, action: "status", entity: "Order", entityId: order._id, details: req.body.status });
    res.json(order);
  })
);
