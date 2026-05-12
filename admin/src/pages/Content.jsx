import { Facebook, Instagram, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import { api } from "../utils/api.js";

const fallback = {
  brandName: "Curio Corner",
  logo: { url: "/assets/logo.jpg" },
  cover: { url: "/assets/cover.jpg" },
  aboutImage: { url: "/assets/cover.jpg" },
  heroImages: [{ url: "/assets/cover.jpg" }, { url: "/assets/cover.jpg" }, { url: "/assets/cover.jpg" }],
  homepage: { headline: "", subheadline: "", ctaLabel: "" },
  sections: {
    featured: {
      eyebrow: "Featured",
      title: "Pieces made to feel personal",
      body: "Soft textures, careful palettes, and handmade finishing turn simple gifts into keepsakes."
    },
    categories: {
      eyebrow: "Categories",
      title: "Designed around the occasion",
      body: "",
      tileBody: "Explore handmade details for meaningful gifting."
    },
    trending: { eyebrow: "Trending", title: "Loved this week", body: "" },
    gallery: { eyebrow: "Gallery", title: "A softer way to gift", body: "" },
    contact: { eyebrow: "Custom order", title: "Tell us the feeling. We will shape the gift.", body: "" }
  },
  about: { title: "", body: "" },
  contact: { phone: "", email: "", address: "" },
  whatsappNumber: "",
  socialLinks: [],
  testimonials: []
};

const mergeSettings = (data = {}) => ({
  ...fallback,
  ...data,
  homepage: { ...fallback.homepage, ...data.homepage },
  sections: {
    featured: { ...fallback.sections.featured, ...data.sections?.featured },
    categories: { ...fallback.sections.categories, ...data.sections?.categories },
    trending: { ...fallback.sections.trending, ...data.sections?.trending },
    gallery: { ...fallback.sections.gallery, ...data.sections?.gallery },
    contact: { ...fallback.sections.contact, ...data.sections?.contact }
  },
  about: { ...fallback.about, ...data.about },
  contact: { ...fallback.contact, ...data.contact }
});

const convertDriveLinks = (text) => {
  if (!text) return text;
  let converted = text.replace(/(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/[^\s]*)?/gi, "https://drive.google.com/uc?export=view&id=$1");
  converted = converted.replace(/(?:https?:\/\/)?(?:www\.)?(?:drive|drive\.usercontent)\.google\.com\/(?:open|uc|download)\?(?:[^&\s]*&)*id=([a-zA-Z0-9_-]+)[^\s]*/gi, "https://drive.google.com/uc?export=view&id=$1");
  return converted;
};

export default function Content() {
  const [settings, setSettings] = useState(fallback);
  const [socialLinks, setSocialLinks] = useState({ facebook: "", instagram: "" });
  const [testimonialText, setTestimonialText] = useState("");
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      const merged = mergeSettings(data);
      setSettings(merged);
      setSocialLinks({
        facebook: merged.socialLinks?.find((link) => link.label?.toLowerCase() === "facebook")?.url || "",
        instagram: merged.socialLinks?.find((link) => link.label?.toLowerCase() === "instagram")?.url || ""
      });
      setTestimonialText((merged.testimonials || []).map((item) => `${item.name}|${item.location || ""}|${item.quote}`).join("\n"));
    });
  }, []);

  const setNested = (group, key, value) => setSettings((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));
  const setSection = (section, key, value) =>
    setSettings((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [section]: { ...current.sections?.[section], [key]: value }
      }
    }));

  const save = async (event) => {
    event.preventDefault();
    const nextSocialLinks = [
      { label: "Facebook", url: socialLinks.facebook.trim() },
      { label: "Instagram", url: socialLinks.instagram.trim() }
    ].filter((link) => link.url);
    const testimonials = testimonialText
      .split("\n")
      .map((line) => line.split("|"))
      .filter((parts) => parts[0] && parts[2])
      .map(([name, location, quote]) => ({ name: name.trim(), location: location.trim(), quote: quote.trim() }));

    try {
      const { data } = await api.put("/settings", { ...settings, socialLinks: nextSocialLinks, testimonials });
      setSettings(mergeSettings(data));
      toast.success("Website content updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update content");
    }
  };

  const deleteAsset = (key, index = null) => {
    if (index !== null) {
      setSettings((current) => {
        const newHeroImages = [...(current.heroImages || fallback.heroImages)];
        newHeroImages[index] = { url: "" };
        return { ...current, heroImages: newHeroImages };
      });
    } else {
      setSettings((current) => ({ ...current, [key]: { url: "" } }));
    }
  };

  const uploadAsset = async (key, file, index = null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("images", file);
    setUploading(key);
    try {
      const { data } = await api.post("/media", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const uploaded = data.items?.[0];
      if (uploaded?.url) {
        if (index !== null) {
          setSettings((current) => {
            const newHeroImages = [...(current.heroImages || fallback.heroImages)];
            newHeroImages[index] = { url: uploaded.url, publicId: uploaded.publicId };
            return { ...current, heroImages: newHeroImages };
          });
        } else {
          setSettings((current) => ({ ...current, [key]: { url: uploaded.url, publicId: uploaded.publicId } }));
        }
        toast.success(`${key} uploaded. Save content to publish it.`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading("");
    }
  };

  return (
    <div>
      <PageHeader eyebrow="CMS" title="Website content" />
      <form onSubmit={save} className="grid gap-5">
        <section className="admin-card rounded-[28px] p-5">
          <h2 className="font-display text-2xl font-bold">Brand assets</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-vellum/60">Logo URL</label>
              <div className="flex gap-2">
                <input className="input" value={settings.logo?.url || ""} onChange={(e) => setSettings({ ...settings, logo: { url: convertDriveLinks(e.target.value) } })} placeholder="Paste uploaded logo URL" />
                <label className="flex cursor-pointer items-center rounded-2xl bg-white/8 px-4 hover:bg-clay">
                  <Upload size={17} />
                  <input type="file" accept="image/*" className="hidden" disabled={uploading === "logo"} onChange={(e) => uploadAsset("logo", e.target.files?.[0])} />
                </label>
                <button type="button" onClick={() => deleteAsset("logo")} className="rounded-2xl bg-rosewood px-4"><Trash2 size={17} /></button>
              </div>
              <img src={settings.logo?.url || "/assets/logo.jpg"} alt="" className="mt-3 h-20 w-20 rounded-2xl object-cover" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-vellum/60">Cover Image URL</label>
              <div className="flex gap-2">
                <input className="input" value={settings.cover?.url || ""} onChange={(e) => setSettings({ ...settings, cover: { url: convertDriveLinks(e.target.value) } })} placeholder="Paste uploaded cover URL" />
                <label className="flex cursor-pointer items-center rounded-2xl bg-white/8 px-4 hover:bg-clay">
                  <Upload size={17} />
                  <input type="file" accept="image/*" className="hidden" disabled={uploading === "cover"} onChange={(e) => uploadAsset("cover", e.target.files?.[0])} />
                </label>
                <button type="button" onClick={() => deleteAsset("cover")} className="rounded-2xl bg-rosewood px-4"><Trash2 size={17} /></button>
              </div>
              <img src={settings.cover?.url || "/assets/cover.jpg"} alt="" className="mt-3 h-28 w-full rounded-2xl object-cover" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-vellum/60">About Image URL</label>
              <div className="flex gap-2">
                <input className="input" value={settings.aboutImage?.url || ""} onChange={(e) => setSettings({ ...settings, aboutImage: { url: convertDriveLinks(e.target.value) } })} placeholder="Paste uploaded about image URL" />
                <label className="flex cursor-pointer items-center rounded-2xl bg-white/8 px-4 hover:bg-clay">
                  <Upload size={17} />
                  <input type="file" accept="image/*" className="hidden" disabled={uploading === "aboutImage"} onChange={(e) => uploadAsset("aboutImage", e.target.files?.[0])} />
                </label>
                <button type="button" onClick={() => deleteAsset("aboutImage")} className="rounded-2xl bg-rosewood px-4"><Trash2 size={17} /></button>
              </div>
              <img src={settings.aboutImage?.url || "/assets/cover.jpg"} alt="" className="mt-3 h-28 w-full rounded-2xl object-cover" />
            </div>
          </div>
        </section>

        <section className="admin-card rounded-[28px] p-5">
          <h2 className="font-display text-2xl font-bold">Hero Images (3 Photos)</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <label className="mb-2 block text-sm text-vellum/60">Hero Image {index + 1}</label>
                <div className="flex gap-2">
                  <input className="input" value={settings.heroImages?.[index]?.url || ""} onChange={(e) => {
                    const newHeroImages = [...(settings.heroImages || fallback.heroImages)];
                    newHeroImages[index] = { url: convertDriveLinks(e.target.value) };
                    setSettings({ ...settings, heroImages: newHeroImages });
                  }} placeholder="Paste image URL" />
                  <label className="flex cursor-pointer items-center rounded-2xl bg-white/8 px-4 hover:bg-clay">
                    <Upload size={17} />
                    <input type="file" accept="image/*" className="hidden" disabled={uploading === `heroImage${index}`} onChange={(e) => uploadAsset(`heroImage${index}`, e.target.files?.[0], index)} />
                  </label>
                  <button type="button" onClick={() => deleteAsset("heroImages", index)} className="rounded-2xl bg-rosewood px-4"><Trash2 size={17} /></button>
                </div>
                <img src={settings.heroImages?.[index]?.url || "/assets/cover.jpg"} alt="" className="mt-3 h-28 w-full rounded-2xl object-cover" />
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card rounded-[28px] p-5">
          <h2 className="font-display text-2xl font-bold">Homepage</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <input className="input" value={settings.brandName || ""} onChange={(e) => setSettings({ ...settings, brandName: e.target.value })} placeholder="Brand name" />
            <input className="input" value={settings.homepage?.ctaLabel || ""} onChange={(e) => setNested("homepage", "ctaLabel", e.target.value)} placeholder="CTA label" />
            <input className="input lg:col-span-2" value={settings.homepage?.headline || ""} onChange={(e) => setNested("homepage", "headline", e.target.value)} placeholder="Hero headline" />
            <textarea className="input lg:col-span-2" rows="3" value={settings.homepage?.subheadline || ""} onChange={(e) => setNested("homepage", "subheadline", e.target.value)} placeholder="Hero subheadline" />
          </div>
        </section>

        <section className="admin-card rounded-[28px] p-5">
          <h2 className="font-display text-2xl font-bold">Homepage sections</h2>
          <div className="mt-5 grid gap-5">
            <SectionCopyFields title="Featured section" section={settings.sections?.featured} onChange={(key, value) => setSection("featured", key, value)} />
            <SectionCopyFields title="Categories section" section={settings.sections?.categories} onChange={(key, value) => setSection("categories", key, value)} showTileBody />
            <SectionCopyFields title="Trending section" section={settings.sections?.trending} onChange={(key, value) => setSection("trending", key, value)} />
            <SectionCopyFields title="Gallery section" section={settings.sections?.gallery} onChange={(key, value) => setSection("gallery", key, value)} />
            <SectionCopyFields title="Contact block" section={settings.sections?.contact} onChange={(key, value) => setSection("contact", key, value)} />
          </div>
        </section>

        <section className="admin-card rounded-[28px] p-5">
          <h2 className="font-display text-2xl font-bold">About and contact</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <input className="input lg:col-span-2" value={settings.about?.title || ""} onChange={(e) => setNested("about", "title", e.target.value)} placeholder="About title" />
            <textarea className="input lg:col-span-2" rows="4" value={settings.about?.body || ""} onChange={(e) => setNested("about", "body", e.target.value)} placeholder="About body" />
            <input className="input" value={settings.contact?.phone || ""} onChange={(e) => setNested("contact", "phone", e.target.value)} placeholder="Phone" />
            <input className="input" value={settings.contact?.email || ""} onChange={(e) => setNested("contact", "email", e.target.value)} placeholder="Email" />
            <input className="input" value={settings.contact?.address || ""} onChange={(e) => setNested("contact", "address", e.target.value)} placeholder="Address" />
            <input className="input" value={settings.whatsappNumber || ""} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} placeholder="WhatsApp number" />
          </div>
        </section>

        <section className="admin-card rounded-[28px] p-5">
          <h2 className="font-display text-2xl font-bold">Testimonials and social</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <textarea className="input" rows="5" value={testimonialText} onChange={(e) => setTestimonialText(e.target.value)} placeholder="One per line: Name|Location|Quote" />
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-vellum/70">
                  <Facebook size={17} /> Facebook page link
                </span>
                <input className="input" value={socialLinks.facebook} onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })} placeholder="https://facebook.com/yourpage" />
              </label>
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-vellum/70">
                  <Instagram size={17} /> Instagram page link
                </span>
                <input className="input" value={socialLinks.instagram} onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })} placeholder="https://instagram.com/yourpage" />
              </label>
            </div>
          </div>
        </section>

        <button className="inline-flex w-fit items-center gap-2 rounded-full bg-vellum px-6 py-3 font-semibold text-ink hover:bg-gold">
          <Save size={18} /> Save Content
        </button>
      </form>
    </div>
  );
}

function SectionCopyFields({ title, section = {}, onChange, showTileBody = false }) {
  return (
    <div className="rounded-[24px] border border-white/10 p-4">
      <h3 className="mb-4 font-semibold">{title}</h3>
      <div className="grid gap-3 lg:grid-cols-2">
        <input className="input" value={section.eyebrow || ""} onChange={(event) => onChange("eyebrow", event.target.value)} placeholder="Small eyebrow text" />
        <input className="input" value={section.title || ""} onChange={(event) => onChange("title", event.target.value)} placeholder="Section title" />
        <textarea className="input lg:col-span-2" rows="2" value={section.body || ""} onChange={(event) => onChange("body", event.target.value)} placeholder="Section subtitle/body text" />
        {showTileBody && <textarea className="input lg:col-span-2" rows="2" value={section.tileBody || ""} onChange={(event) => onChange("tileBody", event.target.value)} placeholder="Text under each category card" />}
      </div>
    </div>
  );
}
