import express from "express";
import { AdminPushSubscription } from "../models/AdminPushSubscription.js";
import { protectAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getVapidPublicKey, isPushConfigured } from "../utils/pushNotifications.js";

export const pushRoutes = express.Router();

pushRoutes.use(protectAdmin);

pushRoutes.get(
  "/config",
  asyncHandler(async (req, res) => {
    const [enabled, publicKey] = await Promise.all([isPushConfigured(), getVapidPublicKey()]);

    res.json({
      enabled,
      publicKey
    });
  })
);

pushRoutes.post(
  "/subscriptions",
  asyncHandler(async (req, res) => {
    const { subscription } = req.body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ message: "Invalid push subscription" });
    }

    await AdminPushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        $set: {
          admin: req.admin._id,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
          },
          userAgent: req.get("user-agent"),
          lastSeenAt: new Date()
        },
        $unset: {
          failedAt: "",
          lastError: ""
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: "Push notifications enabled" });
  })
);

pushRoutes.delete(
  "/subscriptions",
  asyncHandler(async (req, res) => {
    const { endpoint } = req.body;
    if (endpoint) {
      await AdminPushSubscription.deleteOne({ endpoint, admin: req.admin._id });
    }
    res.json({ message: "Push notifications disabled" });
  })
);
