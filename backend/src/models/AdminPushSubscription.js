import mongoose from "mongoose";

const adminPushSubscriptionSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true }
    },
    userAgent: String,
    lastSeenAt: Date,
    failedAt: Date,
    lastError: String
  },
  { timestamps: true }
);

adminPushSubscriptionSchema.index({ admin: 1, updatedAt: -1 });

export const AdminPushSubscription = mongoose.model("AdminPushSubscription", adminPushSubscriptionSchema);
