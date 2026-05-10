import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    alt: String,
<<<<<<< HEAD
    folder: { type: String, default: "curio-corner" },
=======
    folder: { type: String, default: "mahin" },
>>>>>>> 4292013668882ef06c50bcc3180dcc50f830320d
    format: String,
    width: Number,
    height: Number,
    bytes: Number
  },
  { timestamps: true }
);

export const Media = mongoose.model("Media", mediaSchema);
