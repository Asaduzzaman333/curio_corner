import { Save, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import { api } from "../utils/api.js";

const fallback = {
  brandName: "Curio Corner",
  logo: { url: "/assets/logo.jpg" },
  cover: { url: "/assets/cover.jpg" },
  homepage: { headline: "", subheadline: "", ctaLabel: "" },
  about: { title: "", body: "" },
  contact: { phone: "", email: "", address: "" },
  whatsappNumber: "",
  socialLinks: [],
  testimonials: []
};

export default function Content() {
  const [settings, setSettings] = useState(fallback);
  const [socialText, setSocialText] = useState("");
  const [testimonialText, setTestimonialText] = useState("");
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      const merged = { ...fallback, ...data };
      setSettings(merged);
      setSocialText((merged.socialLinks || []).map((link) => `${link.label}|${link.url}`).join("\n"));
      setTestimonialText((merged.testimonials || []).map((item) => `${item.name}|${item.location || ""}|${item.quote}`).join("\n"));
    });
  }, []);

  const setNested = (group, key, value) => setSettings((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));

  const save = async (event) => {
    event.preventDefault();
    const socialLinks = socialText.split("\n").map((line) => line.split("|")).filter((parts) => parts[0] && parts[1]).map(([label, url]) => ({ label: label.trim(), url: url.trim() }));
    const testimonials = testimonialText
      .split("\n")
      .map((line) => line.split("|"))
      .filter((parts) => parts[0] && parts[2])
      .map(([name, location, quote]) => ({ name: name.trim(), location: location.trim(), quote: quote.trim() }));

    try {
      const { data } = await api.put("/settings", { ...settings, socialLinks, testimonials });
      setSettings(data);
      toast.success("Website content updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update content");
    }
  };

  const deleteAsset = (key) => {
    setSettings((current) => ({ ...current, [key]: { url: "" } }));
  };

  const uploadAsset = async (key, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("images", file);
    setUploading(key);
    try {
      const { data } = await api.post("/media", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const uploaded = data.items?.[0];
      if (uploaded?.url) {
        setSettings((current) => ({ ...current, [key]: { url: uploaded.url, publicId: uploaded.publicId } }));
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
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-vellum/60">Logo URL</label>
              <div className="flex gap-2">
                <input className="input" value={settings.logo?.url || ""} onChange={(e) => setSettings({ ...settings, logo: { url: e.target.value } })} placeholder="Paste uploaded logo URL" />
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
                <input className="input" value={settings.cover?.url || ""} onChange={(e) => setSettings({ ...settings, cover: { url: e.target.value } })} placeholder="Paste uploaded cover URL" />
                <label className="flex cursor-pointer items-center rounded-2xl bg-white/8 px-4 hover:bg-clay">
                  <Upload size={17} />
                  <input type="file" accept="image/*" className="hidden" disabled={uploading === "cover"} onChange={(e) => uploadAsset("cover", e.target.files?.[0])} />
                </label>
                <button type="button" onClick={() => deleteAsset("cover")} className="rounded-2xl bg-rosewood px-4"><Trash2 size={17} /></button>
              </div>
              <img src={settings.cover?.url || "/assets/cover.jpg"} alt="" className="mt-3 h-28 w-full rounded-2xl object-cover" />
            </div>
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
            <textarea className="input" rows="5" value={socialText} onChange={(e) => setSocialText(e.target.value)} placeholder="One per line: Label|https://url.com" />
          </div>
        </section>

        <button className="inline-flex w-fit items-center gap-2 rounded-full bg-vellum px-6 py-3 font-semibold text-ink hover:bg-gold">
          <Save size={18} /> Save Content
        </button>
      </form>
    </div>
  );
}
