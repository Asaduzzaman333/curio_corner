import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      const scrollToHash = () => {
        const element = document.querySelector(hash);
        if (!element) return;

        const headerOffset = 96;
        const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: "smooth" });
      };

      const timer = window.setTimeout(scrollToHash, 80);
      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    return undefined;
  }, [hash, pathname]);
  return null;
}
