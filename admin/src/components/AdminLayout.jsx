import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Boxes, LogOut, Menu, MessageSquareText, PackageCheck, Tags, X, Bell, Check, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const nav = [
  { label: "Dashboard", to: "/", icon: BarChart3 },
  { label: "Products", to: "/products", icon: Boxes },
  { label: "Categories", to: "/categories", icon: Tags },
  { label: "Orders", to: "/orders", icon: PackageCheck },
  { label: "Content", to: "/content", icon: MessageSquareText }
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  // Initialize Socket.IO connection
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Listen for new order notifications
    socket.on("new-order", (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString("en-US"),
          ...data
        },
        ...prev
      ]);
      
      // Show toast notification
      toast.success(`New Order: ${data.order.customerName}`, {
        duration: 5,
        icon: "📦"
      });
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

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
      {/* Notification Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={() => setOpen(true)} className="admin-card rounded-2xl p-3 md:hidden" aria-label="Open menu">
          <Menu />
        </button>
        <div className="ml-auto">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="admin-card relative flex items-center gap-2 rounded-2xl px-4 py-3 transition hover:shadow-md"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rosewood text-xs font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-vellum/20 bg-ink shadow-lift">
                <div className="sticky top-0 flex items-center justify-between border-b border-vellum/20 bg-ink px-4 py-3">
                  <h3 className="font-semibold text-vellum">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs font-semibold text-vellum/70 hover:text-vellum transition"
                      aria-label="Clear all"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-vellum/50">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y divide-vellum/10">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="border-l-4 border-clay bg-vellum/5 p-3 hover:bg-vellum/10 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-vellum text-sm">{notif.message}</p>
                            <div className="mt-2 grid gap-1 text-xs text-vellum/70">
                              <p>👤 Customer: {notif.order.customerName}</p>
                              <p>📞 Phone: {notif.order.phone}</p>
                              <p>💰 Total: ${notif.order.total}</p>
                              <p>📦 Items: {notif.order.itemCount}</p>
                              <p className="text-vellum/50 text-xs">{notif.timestamp}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeNotification(notif.id)}
                            className="flex-shrink-0 p-1 rounded hover:bg-vellum/20 transition"
                            aria-label="Remove"
                          >
                            <Trash2 size={16} className="text-vellum/50" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
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
