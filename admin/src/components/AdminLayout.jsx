import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Boxes, LogOut, Menu, MessageSquareText, PackageCheck, Tags, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const nav = [
  { label: "Dashboard", to: "/", icon: BarChart3 },
  { label: "Products", to: "/products", icon: Boxes },
  { label: "Categories", to: "/categories", icon: Tags },
  { label: "Orders", to: "/orders", icon: PackageCheck },
  { label: "Content", to: "/content", icon: MessageSquareText }
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate("/");
  };

  const Sidebar = () => (
    <aside className="admin-card flex h-full flex-col rounded-[28px] p-4">
      <div className="mb-8 flex items-center gap-3 px-2">
        <img src={`${import.meta.env.BASE_URL}assets/logo.jpg`} alt="" className="h-11 w-11 rounded-full object-cover" />
        <div>
          <p className="font-display text-xl font-bold">Curio Corner Admin</p>
          <p className="text-xs text-vellum/50">{admin?.email}</p>
        </div>
      </div>
      <nav className="grid gap-2">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-vellum text-ink" : "text-vellum/70 hover:bg-white/8 hover:text-vellum"}`
              }
            >
              <Icon size={18} /> {item.label}
            </NavLink>
          );
        })}
      </nav>
      <button onClick={signOut} className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-vellum/70 hover:bg-white/8 hover:text-vellum">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen p-4 md:p-6">
      <button onClick={() => setOpen(true)} className="admin-card mb-4 rounded-2xl p-3 md:hidden" aria-label="Open menu">
        <Menu />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 md:hidden">
          <div className="ml-auto h-full w-80 max-w-full">
            <button onClick={() => setOpen(false)} className="mb-3 ml-auto block rounded-full bg-vellum p-2 text-ink" aria-label="Close">
              <X />
            </button>
            <Sidebar />
          </div>
        </div>
      )}
      <div className="mx-auto grid max-w-[1500px] gap-5 md:grid-cols-[280px_1fr]">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
