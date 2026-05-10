import mongoose from "mongoose";
import slugify from "slugify";

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    alt: String
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: [mediaSchema],
    videoUrl: String,
    stockStatus: {
      type: String,
      enum: ["in-stock", "made-to-order", "low-stock", "out-of-stock"],
      default: "made-to-order"
    },
    tags: [{ type: String, trim: true }],
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    isEnabled: { type: Boolean, default: true },
    seoTitle: String,
    seoDescription: String
  },
  { timestamps: true }
);

productSchema.pre("validate", function makeSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Product = mongoose.model("Product", productSchema);
