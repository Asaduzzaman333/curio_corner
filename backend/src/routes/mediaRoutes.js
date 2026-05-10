import express from "express";
import { Readable } from "stream";
import { Media } from "../models/Media.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { protectAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { configureCloudinary, cloudinary } from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const mediaRoutes = express.Router();

const uploadBuffer = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "curio-corner", resource_type: "image", quality: "auto", fetch_format: "auto" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    Readable.from(file.buffer).pipe(stream);
  });

mediaRoutes.get(
  "/",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const items = await Media.find({}).sort({ createdAt: -1 });
    res.json({ items });
  })
);

mediaRoutes.post(
  "/",
  protectAdmin,
  upload.array("images", 8),
  asyncHandler(async (req, res) => {
    if (!configureCloudinary()) {
      return res.status(400).json({ message: "Cloudinary environment variables are not configured" });
    }

    const uploaded = await Promise.all(req.files.map(uploadBuffer));
    const media = await Media.insertMany(
      uploaded.map((item) => ({
        url: item.secure_url,
        publicId: item.public_id,
        format: item.format,
        width: item.width,
        height: item.height,
        bytes: item.bytes
      }))
    );

    await ActivityLog.create({ actor: req.admin.email, action: "upload", entity: "Media", details: `${media.length} images` });
    res.status(201).json({ items: media });
  })
);

mediaRoutes.delete(
  "/:id",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });
    if (configureCloudinary() && media.publicId) {
      await cloudinary.uploader.destroy(media.publicId);
    }
    await ActivityLog.create({ actor: req.admin.email, action: "delete", entity: "Media", entityId: media._id });
    res.json({ message: "Media deleted" });
  })
);
