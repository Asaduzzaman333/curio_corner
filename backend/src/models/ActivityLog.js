import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actor: String,
    action: { type: String, required: true },
    entity: String,
    entityId: String,
    details: String
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
