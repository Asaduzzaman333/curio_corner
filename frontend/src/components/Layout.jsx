import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, Moon, ShoppingBag, Sun, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../context/CartContext.jsx";
import { useSite } from "../context/SiteContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import WhatsAppButton from "./WhatsAppButton.jsx";

const nav = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Contact", to: "/#contact" }
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { settings } = useSite();
  const { theme, toggleTheme } = useTheme();

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (!element) return false;

    const headerOffset = 96;
    const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.history.replaceState(null, "", "/#contact");
    window.scrollTo({ top, behavior: "smooth" });
    return true;
  };

  const handleContactClick = (event) => {
    if (window.location.pathname !== "/") return;
    event.preventDefault();
    scrollToContact();
    setOpen(false);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-paper text-ink transition-colors dark:bg-[#17120f] dark:text-vellum">
      <header className="fixed inset-x-0 top-0 z-40 px-4 py-3">
        <nav className="glass mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-3 shadow-soft">
          <Link to="/" className="flex items-center gap-3">
            <img src={settings.logo?.url || "/assets/logo.jpg"} alt={settings.brandName} className="h-10 w-10 rounded-full object-cover" />
            <span className="font-display text-lg font-bold sm:text-xl">{settings.brandName}</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={item.to === "/#contact" ? handleContactClick : undefined} className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-clay" : "hover:text-clay"}`}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Toggle theme" onClick={toggleTheme} className="focus-ring rounded-full p-2 hover:bg-white/50 dark:hover:bg-white/10">
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <Link aria-label="Checkout cart" to="/checkout" className="focus-ring relative rounded-full p-2 hover:bg-white/50 dark:hover:bg-white/10">
              <ShoppingBag size={20} />
              {count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-rosewood px-1.5 text-[10px] font-bold text-white">{count}</span>}
            </Link>
            <button aria-label="Open menu" onClick={() => setOpen(true)} className="focus-ring rounded-full p-2 md:hidden">
              <Menu size={21} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-ink/45 p-4 md:hidden">
            <motion.div initial={{ x: 80 }} animate={{ x: 0 }} exit={{ x: 80 }} className="ml-auto h-full w-72 rounded-[28px] bg-vellum p-5 shadow-lift dark:bg-[#211915]">
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="ml-auto block rounded-full p-2">
                <X />
              </button>
              <div className="mt-8 grid gap-4">
                {nav.map((item) => (
                  <Link key={item.to} to={item.to} onClick={item.to === "/#contact" ? handleContactClick : () => setOpen(false)} className="rounded-2xl px-4 py-3 text-lg font-semibold hover:bg-paper dark:hover:bg-white/10">
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <Outlet />
      </main>
      <footer className="paper-texture border-t border-ink/10 px-5 py-12 dark:border-white/10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src={settings.logo?.url || "/assets/logo.jpg"} alt="" className="h-12 w-12 rounded-full object-cover" />
              <h2 className="font-display text-2xl font-bold">{settings.brandName}</h2>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-ink/70 dark:text-vellum/70">{settings.about?.body}</p>
          </div>
          <div>
            <h3 className="font-semibold">Visit</h3>
            <p className="mt-4 text-sm leading-7 text-ink/70 dark:text-vellum/70">{settings.contact?.address}</p>
            <p className="text-sm text-ink/70 dark:text-vellum/70">{settings.contact?.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold">Social</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {settings.socialLinks?.map((link) => (
                <a key={link.label} href={link.url} className="rounded-full border border-ink/10 px-4 py-2 text-sm hover:border-clay hover:text-clay dark:border-white/10">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
}
