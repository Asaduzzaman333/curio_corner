import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    label: String,
    url: String
  },
  { _id: false }
);

const sectionTextSchema = new mongoose.Schema(
  {
    eyebrow: String,
    title: String,
    body: String,
    tileBody: String
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    brandName: { type: String, default: "Curio Corner" },
    logo: { url: { type: String, default: "/assets/logo.jpg" }, publicId: String },
    cover: { url: { type: String, default: "/assets/cover.jpg" }, publicId: String },
    aboutImage: { url: { type: String, default: "/assets/cover.jpg" }, publicId: String },
    heroImages: {
      type: [{ url: String, publicId: String }],
      default: [
        { url: "/assets/cover.jpg" },
        { url: "/assets/cover.jpg" },
        { url: "/assets/cover.jpg" }
      ]
    },
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
    },
    sections: {
      featured: {
        type: sectionTextSchema,
        default: () => ({
          eyebrow: "Featured",
          title: "Pieces made to feel personal",
          body: "Soft textures, careful palettes, and handmade finishing turn simple gifts into keepsakes."
        })
      },
      categories: {
        type: sectionTextSchema,
        default: () => ({
          eyebrow: "Categories",
          title: "Designed around the occasion",
          body: "",
          tileBody: "Explore handmade details for meaningful gifting."
        })
      },
      trending: {
        type: sectionTextSchema,
        default: () => ({
          eyebrow: "Trending",
          title: "Loved this week",
          body: ""
        })
      },
      gallery: {
        type: sectionTextSchema,
        default: () => ({
          eyebrow: "Gallery",
          title: "A softer way to gift",
          body: ""
        })
      },
      contact: {
        type: sectionTextSchema,
        default: () => ({
          eyebrow: "Custom order",
          title: "Tell us the feeling. We will shape the gift.",
          body: ""
        })
      }
    }
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
