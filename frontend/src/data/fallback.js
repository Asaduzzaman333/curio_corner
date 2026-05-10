export const fallbackSettings = {
<<<<<<< HEAD
  brandName: "Curio Corner",
=======
  brandName: "Mahin Handmade",
>>>>>>> 4292013668882ef06c50bcc3180dcc50f830320d
  logo: { url: "/assets/logo.jpg" },
  cover: { url: "/assets/cover.jpg" },
  whatsappNumber: "+8801700000000",
  homepage: {
    headline: "Handmade gifts with a soul",
    subheadline: "Premium paper crafts, cards, curated gift boxes, and custom keepsakes made for the people you love.",
    ctaLabel: "Explore Collection"
  },
  about: {
    title: "Crafted for moments that deserve feeling",
    body: "Every card, box, and keepsake is shaped by hand with layered paper, careful color, and a personal story in mind."
  },
  contact: {
    phone: "+880 1700 000000",
<<<<<<< HEAD
    email: "hello@curiocorner.com",
=======
    email: "hello@mahinhandmade.com",
>>>>>>> 4292013668882ef06c50bcc3180dcc50f830320d
    address: "Dhaka, Bangladesh"
  },
  testimonials: [
    { name: "Sadia Rahman", quote: "The gift box felt personal before I even wrote the note.", location: "Dhaka" },
    { name: "Nabila Chowdhury", quote: "Elegant, warm, and beautifully finished. It looked more expensive than anything in stores.", location: "Chittagong" }
  ],
  socialLinks: [
    { label: "Instagram", url: "https://instagram.com" },
    { label: "Facebook", url: "https://facebook.com" }
  ]
};

export const categories = ["Handmade Cards", "Gift Boxes", "Handmade Art", "Craft Items", "Customized Gifts"];

export const fallbackProducts = [
  {
    _id: "demo-1",
    name: "Pressed Rose Keepsake Card",
    slug: "pressed-rose-keepsake-card",
    description: "A layered handmade card with pressed floral detail, cotton ribbon, and room for a private message.",
    category: "Handmade Cards",
    price: 650,
    discountPrice: 540,
    images: [{ url: "/assets/cover.jpg", alt: "Handmade rose card" }],
    stockStatus: "made-to-order",
    tags: ["handmade", "customized"],
    isFeatured: true,
    isTrending: true
  },
  {
    _id: "demo-2",
    name: "Blush Memory Gift Box",
    slug: "blush-memory-gift-box",
    description: "A premium craft gift box with art paper layers, keepsake envelope, and delicate hand-finished details.",
    category: "Gift Boxes",
    price: 2200,
    discountPrice: 1950,
    images: [{ url: "/assets/cover.jpg", alt: "Handmade gift box" }],
    stockStatus: "in-stock",
    tags: ["gift box", "premium"],
    isFeatured: true,
    isTrending: true
  },
  {
    _id: "demo-3",
    name: "Custom Paper Portrait Frame",
    slug: "custom-paper-portrait-frame",
    description: "A dimensional paper art portrait designed from your story, palette, and occasion.",
    category: "Customized Gifts",
    price: 3400,
    images: [{ url: "/assets/cover.jpg", alt: "Custom paper portrait" }],
    stockStatus: "made-to-order",
    tags: ["custom", "paper art"],
    isFeatured: true
  },
  {
    _id: "demo-4",
    name: "Botanical Desk Mini Art",
    slug: "botanical-desk-mini-art",
    description: "Small handmade botanical art for desks, shelves, and thoughtful personal gifting.",
    category: "Handmade Art",
    price: 1250,
    images: [{ url: "/assets/cover.jpg", alt: "Botanical paper art" }],
    stockStatus: "low-stock",
    tags: ["art", "decor"],
    isTrending: true
  }
];
