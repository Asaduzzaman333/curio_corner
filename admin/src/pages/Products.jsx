import { Edit3, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import { api } from "../utils/api.js";

const initialForm = {
  name: "",
  description: "",
  category: "Handmade Cards",
  price: "",
  discountPrice: "",
  mainImageUrl: "",
  galleryImagesText: "",
  videoUrl: "",
  stockStatus: "made-to-order",
  tagsText: "handmade, customized",
  isFeatured: false,
  isTrending: false,
  isPublished: true,
  isEnabled: true
};

const fallbackCategories = ["Handmade Cards", "Gift Boxes", "Handmade Art", "Craft Items", "Customized Gifts"];

const parseImageUrls = (text) =>
  text
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState("");
  const [categoryOptions, setCategoryOptions] = useState(fallbackCategories);

  const load = () => api.get("/products/admin/all").then(({ data }) => setProducts(data.items || [])).catch(() => setProducts([]));
  const loadCategories = () =>
    api
      .get("/categories/admin/all")
      .then(({ data }) => {
        const names = (data.items || []).filter((item) => item.isEnabled).map((item) => item.name);
        setCategoryOptions(names.length ? names : fallbackCategories);
      })
      .catch(() => setCategoryOptions(fallbackCategories));

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  const galleryImageUrls = useMemo(() => parseImageUrls(form.galleryImagesText), [form.galleryImagesText]);
  const imageUrls = useMemo(() => {
    const urls = [form.mainImageUrl.trim(), ...galleryImageUrls].filter(Boolean);
    return [...new Set(urls)];
  }, [form.mainImageUrl, galleryImageUrls]);

  const payload = useMemo(() => ({
    name: form.name,
    description: form.description,
    category: form.category,
    price: Number(form.price),
    discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
    images: imageUrls.map((url) => ({ url, alt: form.name })),
    videoUrl: form.videoUrl,
    stockStatus: form.stockStatus,
    tags: form.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
    isFeatured: form.isFeatured,
    isTrending: form.isTrending,
    isPublished: form.isPublished,
    isEnabled: form.isEnabled
  }), [form, imageUrls]);

  const removeGalleryImage = (urlToRemove) => {
    setForm((current) => ({
      ...current,
      galleryImagesText: parseImageUrls(current.galleryImagesText).filter((url) => url !== urlToRemove).join("\n")
    }));
  };

  const uploadImages = async (files, target = "gallery") => {
    const selected = Array.from(files || []);
    if (!selected.length) return;

    const formData = new FormData();
    selected.forEach((file) => formData.append("images", file));
    setUploadingImages(target);

    try {
      const { data } = await api.post("/media", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const uploadedUrls = (data.items || []).map((item) => item.url).filter(Boolean);
      setForm((current) => {
        if (target === "main") {
          const [mainUrl, ...extraUrls] = uploadedUrls;
          const mergedGallery = [...parseImageUrls(current.galleryImagesText), ...extraUrls];
          return {
            ...current,
            mainImageUrl: mainUrl || current.mainImageUrl,
            galleryImagesText: [...new Set(mergedGallery)].join("\n")
          };
        }

        const merged = [...parseImageUrls(current.galleryImagesText), ...uploadedUrls];
        return { ...current, galleryImagesText: [...new Set(merged)].join("\n") };
      });
      toast.success(`${uploadedUrls.length} product photo${uploadedUrls.length === 1 ? "" : "s"} added`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Photo upload failed");
    } finally {
      setUploadingImages("");
    }
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) await api.put(`/products/${editing}`, payload);
      else await api.post("/products", payload);
      toast.success(editing ? "Product updated" : "Product added");
      setForm(initialForm);
      setEditing(null);
      setOpen(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save product");
    }
  };

  const edit = (product) => {
    setEditing(product._id);
    if (product.category && !categoryOptions.includes(product.category)) {
      setCategoryOptions((current) => [...current, product.category]);
    }
    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "Handmade Cards",
      price: product.price || "",
      discountPrice: product.discountPrice || "",
      mainImageUrl: product.images?.[0]?.url || "",
      galleryImagesText: product.images?.slice(1).map((image) => image.url).join("\n") || "",
      videoUrl: product.videoUrl || "",
      stockStatus: product.stockStatus || "made-to-order",
      tagsText: product.tags?.join(", ") || "",
      isFeatured: Boolean(product.isFeatured),
      isTrending: Boolean(product.isTrending),
      isPublished: Boolean(product.isPublished),
      isEnabled: Boolean(product.isEnabled)
    });
    setOpen(true);
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Product deleted");
    load();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Product management"
        action={
          <button onClick={() => { setOpen(true); setEditing(null); setForm(initialForm); }} className="inline-flex items-center gap-2 rounded-full bg-vellum px-5 py-3 font-semibold text-ink hover:bg-gold">
            <Plus size={18} /> Add Product
          </button>
        }
      />
      {open && (
        <form onSubmit={save} className="admin-card mb-6 rounded-[28px] p-5 md:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <input className="input" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select>
            <input className="input" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input className="input" type="number" placeholder="Discount price" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
            <select className="input" value={form.stockStatus} onChange={(e) => setForm({ ...form, stockStatus: e.target.value })}>
              <option value="in-stock">In stock</option>
              <option value="made-to-order">Made to order</option>
              <option value="low-stock">Low stock</option>
              <option value="out-of-stock">Out of stock</option>
            </select>
            <input className="input" placeholder="Video URL" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
            <textarea className="input lg:col-span-2" rows="4" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <div className="lg:col-span-2">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm text-vellum/60">Main product photo URL</label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm font-semibold hover:bg-clay">
                  <Upload size={16} /> {uploadingImages === "main" ? "Uploading..." : "Upload Main Photo"}
                  <input type="file" accept="image/*" className="hidden" disabled={Boolean(uploadingImages)} onChange={(e) => uploadImages(e.target.files, "main")} />
                </label>
              </div>
              <input className="input" placeholder="Main photo URL. This appears on product cards and as first product image." value={form.mainImageUrl} onChange={(e) => setForm({ ...form, mainImageUrl: e.target.value })} />
              {form.mainImageUrl && (
                <div className="mt-3 w-40 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <img src={form.mainImageUrl} alt={`${form.name || "Product"} main`} className="aspect-square w-full object-cover" />
                  <div className="px-3 py-2 text-xs font-semibold text-vellum/70">Main photo</div>
                </div>
              )}
            </div>
            <div className="lg:col-span-2">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm text-vellum/60">Additional gallery photo URLs</label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm font-semibold hover:bg-clay">
                  <Upload size={16} /> {uploadingImages === "gallery" ? "Uploading..." : "Upload Gallery Photos"}
                  <input type="file" accept="image/*" multiple className="hidden" disabled={Boolean(uploadingImages)} onChange={(e) => uploadImages(e.target.files, "gallery")} />
                </label>
              </div>
              <textarea className="input" rows="4" placeholder="Extra product detail/gallery image URLs, one per line." value={form.galleryImagesText} onChange={(e) => setForm({ ...form, galleryImagesText: e.target.value })} />
              {imageUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {imageUrls.map((url, index) => (
                    <div key={url} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <img src={url} alt={`${form.name || "Product"} ${index + 1}`} className="aspect-square w-full object-cover" />
                      {index === 0 ? (
                        <button type="button" onClick={() => setForm({ ...form, mainImageUrl: "" })} className="absolute right-2 top-2 rounded-full bg-rosewood p-2 text-white shadow-lift">
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <button type="button" onClick={() => removeGalleryImage(url)} className="absolute right-2 top-2 rounded-full bg-rosewood p-2 text-white shadow-lift">
                          <Trash2 size={14} />
                        </button>
                      )}
                      {index === 0 && <span className="absolute bottom-2 left-2 rounded-full bg-ink/80 px-2 py-1 text-[10px] font-semibold text-vellum">Main</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input className="input lg:col-span-2" placeholder="Tags, comma separated" value={form.tagsText} onChange={(e) => setForm({ ...form, tagsText: e.target.value })} />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {["isFeatured", "isTrending", "isPublished", "isEnabled"].map((key) => (
              <label key={key} className="flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-sm">
                <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} /> {key.replace("is", "")}
              </label>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <button className="rounded-full bg-vellum px-6 py-3 font-semibold text-ink hover:bg-gold">{editing ? "Update" : "Create"}</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/12 px-6 py-3 font-semibold">Cancel</button>
          </div>
        </form>
      )}
      <div className="admin-card overflow-hidden rounded-[28px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.18em] text-vellum/50">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Flags</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images?.[0]?.url || "/assets/cover.jpg"} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                      <span className="font-semibold">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-vellum/70">{product.category}</td>
                  <td className="px-5 py-4">৳{product.discountPrice || product.price}</td>
                  <td className="px-5 py-4">{product.stockStatus}</td>
                  <td className="px-5 py-4 text-sm text-vellum/60">{product.isPublished ? "Published" : "Hidden"} · {product.isEnabled ? "Enabled" : "Disabled"}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => edit(product)} className="rounded-full bg-white/8 p-2 hover:bg-clay"><Edit3 size={17} /></button>
                      <button onClick={() => remove(product._id)} className="rounded-full bg-white/8 p-2 hover:bg-rosewood"><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
