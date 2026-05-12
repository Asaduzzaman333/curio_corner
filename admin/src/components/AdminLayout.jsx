import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Bell, BellRing, Boxes, LogOut, Menu, MessageSquareText, PackageCheck, Tags, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../utils/api.js";
import { disablePushNotifications, enablePushNotifications, getPushSupportStatus, registerAdminServiceWorker } from "../utils/pushNotifications.js";

const nav = [
  { label: "Dashboard", to: "/", icon: BarChart3 },
  { label: "Products", to: "/products", icon: Boxes },
  { label: "Categories", to: "/categories", icon: Tags },
  { label: "Orders", to: "/orders", icon: PackageCheck },
  { label: "Content", to: "/content", icon: MessageSquareText }
];

const LAST_ORDER_KEY = "curioAdminLastOrderNotificationId";
const MAX_NOTIFICATIONS = 30;
const POLL_INTERVAL_MS = 12000;

const canUseDeviceNotifications = () => typeof window !== "undefined" && "Notification" in window;

const getNotificationPermission = () => {
  if (!canUseDeviceNotifications()) return "unsupported";
  return getPushSupportStatus();
};

const getItemCount = (order) => order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

const formatCurrency = (amount) => `BDT ${Number(amount || 0).toLocaleString("en-BD")}`;

const formatTimestamp = (value) => {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

const toNotification = (order) => ({
  id: order._id,
  message: `New order from ${order.customerName}`,
  timestamp: formatTimestamp(order.createdAt),
  order: {
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    itemCount: getItemCount(order),
    total: order.subtotal,
    status: order.status
  }
});

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const checkingNotificationsRef = useRef(false);
  const initializedNotificationsRef = useRef(false);
  const lastOrderIdRef = useRef(localStorage.getItem(LAST_ORDER_KEY));
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showNotifications]);

  const rememberLatestOrder = useCallback((orderId) => {
    if (!orderId) return;
    lastOrderIdRef.current = orderId;
    localStorage.setItem(LAST_ORDER_KEY, orderId);
  }, []);

  const addOrderNotifications = useCallback(
    (orders) => {
      if (!orders.length) return;

      const nextNotifications = orders.map(toNotification);
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((notification) => notification.id));
        const uniqueNotifications = nextNotifications.filter((notification) => !existingIds.has(notification.id));
        return [...uniqueNotifications.reverse(), ...prev].slice(0, MAX_NOTIFICATIONS);
      });

      orders.forEach((order) => {
        toast.success(`New order from ${order.customerName}`, { duration: 6000 });
      });

      window.dispatchEvent(new CustomEvent("admin:new-orders", { detail: { orders } }));
    },
    []
  );

  const checkOrderNotifications = useCallback(async () => {
    if (checkingNotificationsRef.current) return;

    checkingNotificationsRef.current = true;
    const knownOrderId = lastOrderIdRef.current;

    try {
      const { data } = await api.get("/orders/notifications", {
        params: {
          limit: knownOrderId ? 10 : 1,
          ...(knownOrderId ? { after: knownOrderId } : {})
        }
      });

      const orders = data.items || [];
      const latestOrder = orders[orders.length - 1];

      if (!orders.length) {
        initializedNotificationsRef.current = true;
        return;
      }

      if (!knownOrderId && !initializedNotificationsRef.current) {
        rememberLatestOrder(latestOrder._id);
        initializedNotificationsRef.current = true;
        return;
      }

      rememberLatestOrder(latestOrder._id);
      initializedNotificationsRef.current = true;
      addOrderNotifications(orders);
    } catch (error) {
      console.error("Could not check order notifications", error);
    } finally {
      checkingNotificationsRef.current = false;
    }
  }, [addOrderNotifications, rememberLatestOrder]);

  useEffect(() => {
    if (!admin) return undefined;

    checkOrderNotifications();
    const intervalId = window.setInterval(checkOrderNotifications, POLL_INTERVAL_MS);
    const checkWhenVisible = () => {
      if (!document.hidden) checkOrderNotifications();
    };

    document.addEventListener("visibilitychange", checkWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", checkWhenVisible);
    };
  }, [admin, checkOrderNotifications]);

  useEffect(() => {
    if (!admin) return undefined;

    let mounted = true;
    registerAdminServiceWorker()
      .then(async (registration) => {
        const permission = getPushSupportStatus();
        if (!mounted) return;

        setNotificationPermission(permission);
        const existingSubscription = await registration.pushManager.getSubscription();
        if (!mounted) return;
        setPushSubscribed(Boolean(existingSubscription));

        if (permission !== "denied" && permission !== "unsupported") {
          const result = await enablePushNotifications();
          if (!mounted) return;
          setNotificationPermission(result.permission);
          setPushSubscribed(Boolean(result.subscribed));
        }
      })
      .catch((error) => {
        console.error("Could not initialize push notifications", error);
      });

    return () => {
      mounted = false;
    };
  }, [admin]);

  const disableDeviceNotifications = async () => {
    try {
      await disablePushNotifications();
      setPushSubscribed(false);
      toast.success("Phone notifications disabled.");
    } catch (error) {
      toast.error(error.message || "Could not disable phone notifications.");
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const signOut = async () => {
    try {
      await disablePushNotifications();
    } catch (error) {
      console.error("Could not disable push notifications during logout", error);
    }

    logout();
    navigate("/");
  };

  const NotificationIcon = pushSubscribed ? BellRing : Bell;
  const notificationStatus =
    pushSubscribed
      ? "Phone push on"
      : notificationPermission === "denied"
        ? "Phone push blocked"
        : notificationPermission === "unsupported"
          ? "Phone push unavailable"
          : "Phone push off";

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
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-vellum text-ink" : "text-vellum/70 hover:bg-white/10 hover:text-vellum"}`
              }
            >
              <Icon size={18} /> {item.label}
            </NavLink>
          );
        })}
      </nav>
      <button onClick={signOut} className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-vellum/70 hover:bg-white/10 hover:text-vellum">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={() => setOpen(true)} className="admin-card rounded-2xl p-3 md:hidden" aria-label="Open menu">
          <Menu />
        </button>
        <div className="ml-auto">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications((value) => !value)}
              className="admin-card relative flex items-center gap-2 rounded-2xl px-4 py-3 transition hover:shadow-glow"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <NotificationIcon size={20} />
              {notifications.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-rosewood px-1 text-xs font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full z-40 mt-2 max-h-96 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-vellum/20 bg-ink shadow-glow">
                <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-vellum/20 bg-ink px-4 py-3">
                  <div>
                    <h3 className="font-semibold text-vellum">Notifications</h3>
                    <p className="text-xs text-vellum/45">{notificationStatus}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pushSubscribed && (
                      <button
                        type="button"
                        onClick={disableDeviceNotifications}
                        className="rounded-full bg-vellum/10 px-3 py-1.5 text-xs font-semibold text-vellum/75 transition hover:text-vellum"
                      >
                        Disable
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllNotifications}
                        className="text-xs font-semibold text-vellum/70 transition hover:text-vellum"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-vellum/50">No notifications</div>
                ) : (
                  <div className="divide-y divide-vellum/10">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="border-l-4 border-clay bg-vellum/5 p-3 transition hover:bg-vellum/10">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowNotifications(false);
                              navigate("/orders");
                            }}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="text-sm font-semibold text-vellum">{notification.message}</p>
                            <div className="mt-2 grid gap-1 text-xs text-vellum/70">
                              <p>Customer: {notification.order.customerName}</p>
                              <p>Phone: {notification.order.phone}</p>
                              <p>Total: {formatCurrency(notification.order.total)}</p>
                              <p>Items: {notification.order.itemCount}</p>
                              <p className="text-xs text-vellum/50">{notification.timestamp}</p>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeNotification(notification.id)}
                            className="flex-shrink-0 rounded p-1 transition hover:bg-vellum/20"
                            aria-label="Remove notification"
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
