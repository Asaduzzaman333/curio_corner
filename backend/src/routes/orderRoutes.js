import express from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { protectAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { orderSchema, orderStatusSchema } from "../validators/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendNewOrderPushNotification } from "../utils/pushNotifications.js";

export const orderRoutes = express.Router();

const notificationFields = "customerName phone address items subtotal status createdAt";

orderRoutes.post(
  "/",
  validate(orderSchema),
  asyncHandler(async (req, res) => {
    const subtotal = req.body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ ...req.body, subtotal });
    try {
      await sendNewOrderPushNotification(order);
    } catch (error) {
      console.error("Failed to send order push notification", error);
    }
    res.status(201).json({ message: "Order placed", order });
  })
);

orderRoutes.get(
  "/notifications",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const requestedLimit = Number(req.query.limit) || 10;
    const limit = Math.min(Math.max(requestedLimit, 1), 25);
    const filter = {};

    if (req.query.after && mongoose.Types.ObjectId.isValid(req.query.after)) {
      filter._id = { $gt: req.query.after };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(limit).select(notificationFields).lean();
    res.json({ items: orders.reverse() });
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
