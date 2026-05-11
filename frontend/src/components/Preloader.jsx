import { useEffect, useState } from "react";
import { useSite } from "../context/SiteContext.jsx";

const MINIMUM_VISIBLE_MS = 1200;

export default function Preloader() {
  const { settings, loading: settingsLoading } = useSite();
  const [pageLoaded, setPageLoaded] = useState(() => document.readyState === "complete");
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleLoad = () => setPageLoaded(true);
    const minimumTimer = window.setTimeout(() => setMinimumElapsed(true), MINIMUM_VISIBLE_MS);

    if (document.readyState === "complete") {
      setPageLoaded(true);
    } else {
      window.addEventListener("load", handleLoad, { once: true });
    }

    return () => {
      window.removeEventListener("load", handleLoad);
      window.clearTimeout(minimumTimer);
    };
  }, []);

  useEffect(() => {
    if (!pageLoaded || settingsLoading || !minimumElapsed) return undefined;

    setLeaving(true);
    const exitTimer = window.setTimeout(() => setVisible(false), 650);
    return () => window.clearTimeout(exitTimer);
  }, [minimumElapsed, pageLoaded, settingsLoading]);

  if (!visible) return null;

  return (
    <div className={`site-preloader ${leaving ? "site-preloader--leaving" : ""}`} role="status" aria-live="polite" aria-label="Loading Curio Corner">
      <div className="site-preloader__grain" />
      <div className="site-preloader__shell">
        <div className="site-preloader__mark">
          <span className="site-preloader__ring" />
          <img src={settings.logo?.url || "/assets/logo.jpg"} alt="" />
        </div>
        <div className="site-preloader__brand">{settings.brandName || "Curio Corner"}</div>
        <div className="site-preloader__bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
