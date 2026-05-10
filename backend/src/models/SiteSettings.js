import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    label: String,
    url: String
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    brandName: { type: String, default: "Mahin Handmade" },
    logo: { url: { type: String, default: "/assets/logo.jpg" }, publicId: String },
    cover: { url: { type: String, default: "/assets/cover.jpg" }, publicId: String },
    about: {
      title: { type: String, default: "Crafted for moments that deserve feeling" },
      body: {
        type: String,
        default:
          "Every card, box, and keepsake is shaped by hand with layered paper, careful color, and a personal story in mind."
      }
    },
    contact: {
      phone: String,
      email: String,
      address: String
    },
    whatsappNumber: { type: String, default: "+8801700000000" },
    socialLinks: [linkSchema],
    testimonials: [
      {
        name: String,
        quote: String,
        location: String
      }
    ],
    homepage: {
      headline: { type: String, default: "Handmade gifts with a soul" },
      subheadline: {
        type: String,
        default: "Premium paper crafts, cards, curated gift boxes, and custom keepsakes made for the people you love."
      },
      ctaLabel: { type: String, default: "Explore Collection" }
    }
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
