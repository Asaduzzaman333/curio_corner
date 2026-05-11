import express from "express";
import { Order } from "../models/Order.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { protectAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { orderSchema, orderStatusSchema } from "../validators/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { io } from "../server.js";

export const orderRoutes = express.Router();

orderRoutes.post(
  "/",
  validate(orderSchema),
  asyncHandler(async (req, res) => {
    const subtotal = req.body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ ...req.body, subtotal });
    
    // Broadcast new order notification to all connected admins
    io.emit("new-order", {
      message: `নতুন অর্ডার: ${order._id}`,
      order: {
        _id: order._id,
        customerName: order.customerName,
        phone: order.phone,
        email: order.email,
        itemCount: order.items.length,
        subtotal: order.subtotal,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }
    });
    
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
