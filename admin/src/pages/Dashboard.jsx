import { DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { api } from "../utils/api.js";

const empty = { totalProducts: 0, totalOrders: 0, revenue: 0, recentOrders: [], productsByCategory: [], activity: [] };

export default function Dashboard() {
  const [data, setData] = useState(empty);

  useEffect(() => {
    api.get("/dashboard").then(({ data }) => setData(data)).catch(() => setData(empty));
  }, []);

  const stats = [
    { label: "Products", value: data.totalProducts, icon: Package },
    { label: "Orders", value: data.totalOrders, icon: ShoppingBag },
    { label: "Revenue", value: `৳${data.revenue}`, icon: DollarSign },
    { label: "Categories", value: data.productsByCategory?.length || 0, icon: TrendingUp }
  ];

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Craft studio dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="admin-card rounded-[28px] p-6">
              <Icon className="text-gold" />
              <p className="mt-5 text-sm text-vellum/55">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-card rounded-[28px] p-6">
          <h2 className="font-display text-2xl font-bold">Recent orders</h2>
          <div className="mt-5 grid gap-3">
            {data.recentOrders?.length ? data.recentOrders.map((order) => (
              <div key={order._id} className="rounded-2xl border border-white/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold">{order.customerName}</p>
                  <span className="rounded-full bg-clay/15 px-3 py-1 text-xs text-clay">{order.status}</span>
                </div>
                <p className="mt-1 text-sm text-vellum/50">{order.phone} · ৳{order.subtotal}</p>
              </div>
            )) : <p className="text-vellum/50">No orders yet.</p>}
          </div>
        </div>
        <div className="admin-card rounded-[28px] p-6">
          <h2 className="font-display text-2xl font-bold">Activity logs</h2>
          <div className="mt-5 grid gap-3">
            {data.activity?.length ? data.activity.map((item) => (
              <div key={item._id} className="rounded-2xl bg-white/5 p-4">
                <p className="font-semibold">{item.action} {item.entity}</p>
                <p className="text-sm text-vellum/45">{item.actor || "system"}</p>
              </div>
            )) : <p className="text-vellum/50">No activity yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
