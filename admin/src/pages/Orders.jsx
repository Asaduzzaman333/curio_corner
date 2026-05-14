import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import { api } from "../utils/api.js";

const statuses = ["pending", "confirmed", "crafting", "ready", "delivered", "cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(() => api.get("/orders").then(({ data }) => setOrders(data.items || [])).catch(() => setOrders([])), []);

  useEffect(() => {
    load();
    window.addEventListener("admin:new-orders", load);
    return () => window.removeEventListener("admin:new-orders", load);
  }, [load]);

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    toast.success("Order updated");
    load();
  };

  const remove = async (order) => {
    if (!confirm(`Delete order from ${order.customerName}?`)) return;
    await api.delete(`/orders/${order._id}`);
    toast.success("Order deleted");
    setExpandedId((current) => (current === order._id ? null : current));
    load();
  };

  return (
    <div>
      <PageHeader eyebrow="Sales" title="Order management" />
      <div className="grid gap-4">
        {orders.length ? orders.map((order) => (
          <article key={order._id} className="admin-card rounded-[28px] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}>
                <div className="flex items-center justify-between lg:justify-start lg:gap-4">
                  <h2 className="font-display text-xl font-bold">{order.customerName}</h2>
                  <p className="text-lg font-bold lg:hidden">৳{order.subtotal}</p>
                </div>
                <p className="mt-1 text-sm text-vellum/55">{order.phone} · {order.items?.length || 0} items</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="hidden text-lg font-bold lg:block mr-4">Total ৳{order.subtotal}</p>
                <select className="input max-w-[140px] px-3 py-2 text-sm md:max-w-xs" value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button 
                  onClick={() => setExpandedId(expandedId === order._id ? null : order._id)} 
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 md:py-2.5"
                >
                  {expandedId === order._id ? "Hide" : "Details"}
                </button>
                <button
                  onClick={() => remove(order)}
                  className="rounded-full bg-white/8 p-2.5 text-vellum hover:bg-rosewood"
                  aria-label={`Delete order from ${order.customerName}`}
                  title="Delete order"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {expandedId === order._id && (
              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="mb-4 text-sm text-vellum/70">
                  <p><strong>Address:</strong> {order.address}</p>
                  {order.notes && <p className="mt-3 rounded-2xl bg-white/5 p-3"><strong>Notes:</strong> {order.notes}</p>}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {order.items?.map((item) => (
                    <div key={`${order._id}-${item.name}`} className="flex items-center gap-3 rounded-2xl border border-white/10 p-3">
                      <img src={item.image || "/assets/cover.jpg"} alt="" className="h-14 w-14 rounded-xl object-cover" />
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-vellum/50">Qty {item.quantity} · ৳{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        )) : (
          <div className="admin-card rounded-[28px] p-10 text-center text-vellum/55">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
