import { Copy, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import { api } from "../utils/api.js";

export default function Media() {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const load = () => api.get("/media").then(({ data }) => setMedia(data.items || [])).catch(() => setMedia([]));
  useEffect(() => {
    load();
  }, []);

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    setUploading(true);
    try {
      await api.post("/media", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Images uploaded");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this media item?")) return;
    await api.delete(`/media/${id}`);
    toast.success("Media deleted");
    load();
  };

  const copy = async (url) => {
    await navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Assets"
        title="Media manager"
        action={
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-vellum px-5 py-3 font-semibold text-ink hover:bg-gold">
            <Upload size={18} /> {uploading ? "Uploading..." : "Upload Images"}
            <input ref={inputRef} type="file" multiple accept="image/*" onChange={upload} className="hidden" disabled={uploading} />
          </label>
        }
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {media.length ? media.map((item) => (
          <article key={item._id} className="admin-card overflow-hidden rounded-[28px]">
            <img src={item.url} alt={item.alt || ""} className="aspect-square w-full object-cover" />
            <div className="flex items-center justify-between gap-2 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm text-vellum/70">{item.publicId || item.url}</p>
                <p className="text-xs text-vellum/40">{item.width}x{item.height}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copy(item.url)} className="rounded-full bg-white/8 p-2 hover:bg-clay" aria-label="Copy URL"><Copy size={16} /></button>
                <button onClick={() => remove(item._id)} className="rounded-full bg-white/8 p-2 hover:bg-rosewood" aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          </article>
        )) : (
          <div className="admin-card col-span-full rounded-[28px] p-10 text-center text-vellum/55">No media uploaded yet. Configure Cloudinary and upload your logo, cover, and product images.</div>
        )}
      </div>
    </div>
  );
}
