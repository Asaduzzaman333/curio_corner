import { Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../utils/api.js";

export default function Checkout() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", notes: "" });
  const [placing, setPlacing] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!items.length) return toast.error("Your cart is empty");
    setPlacing(true);
    try {
      await api.post("/orders", {
        ...form,
        items: items.map((item) => ({
          product: item._id?.startsWith("demo") ? undefined : item._id,
          name: item.name,
          price: item.price,
          image: item.images?.[0]?.url,
          quantity: item.quantity
        }))
      });
      clearCart();
      setForm({ customerName: "", phone: "", address: "", notes: "" });
      toast.success("Order placed. We will contact you soon.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="min-h-screen px-5 pb-24 pt-32">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr]">
        <form onSubmit={submit} className="rounded-[32px] bg-vellum p-6 shadow-soft dark:bg-[#211915] md:p-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-clay">Checkout</p>
          <h1 className="font-display text-4xl font-bold">Delivery details</h1>
          <div className="mt-8 grid gap-4">
            <input required value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} placeholder="Customer name" className="rounded-2xl border border-ink/10 bg-transparent px-4 py-3 outline-none focus:border-clay dark:border-white/10" />
            <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone number" className="rounded-2xl border border-ink/10 bg-transparent px-4 py-3 outline-none focus:border-clay dark:border-white/10" />
            <textarea required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Address" rows="4" className="rounded-2xl border border-ink/10 bg-transparent px-4 py-3 outline-none focus:border-clay dark:border-white/10" />
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Notes, customization, preferred colors..." rows="4" className="rounded-2xl border border-ink/10 bg-transparent px-4 py-3 outline-none focus:border-clay dark:border-white/10" />
          </div>
          <button disabled={placing || !items.length} className="mt-6 w-full rounded-full bg-ink px-6 py-4 font-semibold text-vellum transition hover:bg-clay disabled:cursor-not-allowed disabled:opacity-50 dark:bg-vellum dark:text-ink">
            {placing ? "Placing order..." : "Confirm Order"}
          </button>
        </form>
        <aside className="rounded-[32px] bg-vellum p-6 shadow-soft dark:bg-[#211915] md:p-8">
          <h2 className="font-display text-3xl font-bold">Order summary</h2>
          <div className="mt-6 grid gap-4">
            {items.length ? (
              items.map((item) => (
                <div key={item._id} className="flex gap-4 rounded-3xl border border-ink/10 p-3 dark:border-white/10">
                  <img src={item.images?.[0]?.url || "/assets/cover.jpg"} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-ink/60 dark:text-vellum/60">৳{item.price}</p>
                    <input type="number" min="1" value={item.quantity} onChange={(event) => updateQuantity(item._id, Number(event.target.value))} className="mt-2 w-20 rounded-xl border border-ink/10 bg-transparent px-3 py-1 dark:border-white/10" />
                  </div>
                  <button onClick={() => removeItem(item._id)} className="self-start rounded-full p-2 text-rosewood hover:bg-rosewood/10" aria-label="Remove">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-ink/15 p-8 text-center dark:border-white/15">
                <p>Your cart is empty.</p>
                <Link to="/shop" className="mt-3 inline-block font-semibold text-clay">Browse collection</Link>
              </div>
            )}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-5 text-xl font-bold dark:border-white/10">
            <span>Total</span>
            <span>৳{subtotal}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
