import mongoose from "mongoose";

const pushSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    subject: { type: String, required: true }
  },
  { timestamps: true }
);

export const PushSettings = mongoose.model("PushSettings", pushSettingsSchema);
