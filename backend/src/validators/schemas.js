import { z } from "zod";

const id = z.string().min(12);
const nonEmpty = z.string().trim().min(1);
const maybeUrl = z.string().trim().url().or(z.literal("")).optional();
const sectionTextSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  tileBody: z.string().optional()
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

export const productSchema = z.object({
  body: z.object({
    name: nonEmpty,
    description: nonEmpty,
    category: nonEmpty,
    price: z.coerce.number().min(0),
    discountPrice: z.coerce.number().min(0).optional(),
    images: z
      .array(z.object({ url: z.string().url(), publicId: z.string().optional(), alt: z.string().optional() }))
      .default([]),
    videoUrl: maybeUrl,
    stockStatus: z.enum(["in-stock", "made-to-order", "low-stock", "out-of-stock"]).default("made-to-order"),
    tags: z.array(z.string().trim()).default([]),
    isFeatured: z.boolean().default(false),
    isTrending: z.boolean().default(false),
    isPublished: z.boolean().default(true),
    isEnabled: z.boolean().default(true),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional()
  })
});

export const productUpdateSchema = productSchema.deepPartial();

export const productQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    featured: z.string().optional(),
    trending: z.string().optional(),
    limit: z.coerce.number().min(1).max(60).optional(),
    page: z.coerce.number().min(1).optional()
  })
});

export const orderSchema = z.object({
  body: z.object({
    customerName: nonEmpty,
    phone: nonEmpty,
    address: nonEmpty,
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          product: id.optional(),
          name: nonEmpty,
          price: z.coerce.number().min(0),
          image: z.string().optional(),
          quantity: z.coerce.number().int().min(1)
        })
      )
      .min(1)
  })
});

export const orderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "confirmed", "crafting", "ready", "delivered", "cancelled"])
  })
});

export const settingsSchema = z.object({
  body: z.object({
    brandName: z.string().optional(),
    logo: z.object({ url: z.string(), publicId: z.string().optional() }).optional(),
    cover: z.object({ url: z.string(), publicId: z.string().optional() }).optional(),
    aboutImage: z.object({ url: z.string(), publicId: z.string().optional() }).optional(),
    heroImages: z.array(z.object({ url: z.string(), publicId: z.string().optional() })).optional(),
    about: z.object({ title: z.string().optional(), body: z.string().optional() }).optional(),
    contact: z.object({ phone: z.string().optional(), email: z.string().optional(), address: z.string().optional() }).optional(),
    whatsappNumber: z.string().optional(),
    socialLinks: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
    testimonials: z.array(z.object({ name: z.string(), quote: z.string(), location: z.string().optional() })).optional(),
    homepage: z
      .object({
        headline: z.string().optional(),
        subheadline: z.string().optional(),
        ctaLabel: z.string().optional()
      })
      .optional(),
    sections: z
      .object({
        featured: sectionTextSchema.optional(),
        categories: sectionTextSchema.optional(),
        trending: sectionTextSchema.optional(),
        gallery: sectionTextSchema.optional(),
        contact: sectionTextSchema.optional()
      })
      .optional()
  })
});
