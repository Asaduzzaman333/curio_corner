import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import { api } from "../utils/api.js";

const statuses = ["pending", "confirmed", "crafting", "ready", "delivered", "cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);

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

  return (
    <div>
      <PageHeader eyebrow="Sales" title="Order management" />
      <div className="grid gap-4">
        {orders.length ? orders.map((order) => (
          <article key={order._id} className="admin-card rounded-[28px] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">{order.customerName}</h2>
                <p className="mt-1 text-sm text-vellum/55">{order.phone} · {order.address}</p>
                {order.notes && <p className="mt-3 rounded-2xl bg-white/5 p-3 text-sm text-vellum/70">{order.notes}</p>}
              </div>
              <select className="input max-w-xs" value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
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
            <p className="mt-5 text-right text-xl font-bold">Total ৳{order.subtotal}</p>
          </article>
        )) : (
          <div className="admin-card rounded-[28px] p-10 text-center text-vellum/55">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
