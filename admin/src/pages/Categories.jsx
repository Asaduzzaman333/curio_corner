import { Edit3, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import { api } from "../utils/api.js";

const emptyForm = { name: "", order: "", isEnabled: true };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/categories/admin/all").then(({ data }) => setCategories(data.items || [])).catch(() => setCategories([]));

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const edit = (category) => {
    setEditing(category._id);
    setForm({
      name: category.name || "",
      order: category.order ?? "",
      isEnabled: Boolean(category.isEnabled)
    });
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      order: form.order === "" ? undefined : Number(form.order),
      isEnabled: form.isEnabled
    };

    try {
      if (editing) await api.put(`/categories/${editing}`, payload);
      else await api.post("/categories", payload);
      toast.success(editing ? "Category updated" : "Category added");
      resetForm();
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save category");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category) => {
    if (!confirm(`Delete "${category.name}"?`)) return;

    try {
      await api.delete(`/categories/${category._id}`);
      toast.success("Category deleted");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete category");
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Catalog" title="Category management" />

      <form onSubmit={save} className="admin-card mb-6 rounded-[28px] p-5 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_160px_180px_auto] lg:items-center">
          <input className="input" placeholder="Category name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <input className="input" type="number" placeholder="Order" value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} />
          <label className="flex items-center gap-2 rounded-2xl bg-white/6 px-4 py-3 text-sm font-semibold">
            <input type="checkbox" checked={form.isEnabled} onChange={(event) => setForm({ ...form, isEnabled: event.target.checked })} />
            Enabled
          </label>
          <div className="flex gap-2">
            <button disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-vellum px-5 py-3 font-semibold text-ink hover:bg-gold disabled:opacity-60">
              {editing ? <Save size={17} /> : <Plus size={17} />}
              {editing ? "Update" : "Add"}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 font-semibold">
                <X size={17} /> Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="admin-card overflow-hidden rounded-[28px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.18em] text-vellum/50">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {categories.map((category) => (
                <tr key={category._id}>
                  <td className="px-5 py-4 font-semibold">{category.name}</td>
                  <td className="px-5 py-4 text-vellum/70">{category.order ?? 0}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${category.isEnabled ? "bg-sage/20 text-sage" : "bg-rosewood/20 text-rosewood"}`}>
                      {category.isEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => edit(category)} className="rounded-full bg-white/8 p-2 hover:bg-clay" aria-label={`Edit ${category.name}`}>
                        <Edit3 size={17} />
                      </button>
                      <button onClick={() => remove(category)} className="rounded-full bg-white/8 p-2 hover:bg-rosewood" aria-label={`Delete ${category.name}`}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!categories.length && (
                <tr>
                  <td colSpan="4" className="px-5 py-10 text-center text-vellum/55">No categories yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
