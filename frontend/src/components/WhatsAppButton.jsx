import { MessageCircle } from "lucide-react";
import { useSite } from "../context/SiteContext.jsx";

export default function WhatsAppButton() {
  const { settings } = useSite();
  const number = (settings.whatsappNumber || "").replace(/[^\d]/g, "");
  const href = `https://wa.me/${number}?text=${encodeURIComponent("Hi, I would like to know more about your handmade products.")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition hover:-translate-y-1"
    >
      <MessageCircle size={25} />
    </a>
  );
}
