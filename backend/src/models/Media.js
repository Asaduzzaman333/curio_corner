import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    alt: String,
    folder: { type: String, default: "curio-corner" },
    format: String,
    width: Number,
    height: Number,
    bytes: Number
  },
  { timestamps: true }
);

export const Media = mongoose.model("Media", mediaSchema);
