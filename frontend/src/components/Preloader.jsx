import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSite } from "../context/SiteContext.jsx";
import { subscribeApiLoading } from "../utils/api.js";

const INITIAL_VISIBLE_MS = 2600;
const ROUTE_VISIBLE_MS = 700;
const EXIT_DELAY_MS = 300;

export default function Preloader({ persistent = true }) {
  const { settings, loading: settingsLoading } = useSite();
  const location = useLocation();
  const locationKey = `${location.pathname}${location.search}`;
  const [pageLoaded, setPageLoaded] = useState(() => document.readyState === "complete");
  const [initialMinimumElapsed, setInitialMinimumElapsed] = useState(false);
  const [routeReady, setRouteReady] = useState(true);
  const [apiPending, setApiPending] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(true);
  const isFirstRoute = useRef(true);

  const shouldStayVisible = useMemo(
    () => !pageLoaded || settingsLoading || !initialMinimumElapsed || !routeReady || apiPending > 0,
    [apiPending, initialMinimumElapsed, pageLoaded, routeReady, settingsLoading]
  );

  useEffect(() => {
    const handleLoad = () => setPageLoaded(true);
    const minimumTimer = window.setTimeout(() => setInitialMinimumElapsed(true), INITIAL_VISIBLE_MS);

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
    if (!persistent) return undefined;

    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return undefined;
    }

    setRouteReady(false);
    setVisible(true);
    setLeaving(false);

    const routeTimer = window.setTimeout(() => setRouteReady(true), ROUTE_VISIBLE_MS);
    return () => window.clearTimeout(routeTimer);
  }, [locationKey, persistent]);

  useEffect(() => {
    if (!persistent) return undefined;
    return subscribeApiLoading(setApiPending);
  }, [persistent]);

  useEffect(() => {
    if (!persistent) return undefined;

    if (shouldStayVisible) {
      setVisible(true);
      setLeaving(false);
      return undefined;
    }

    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, EXIT_DELAY_MS);
    const exitTimer = window.setTimeout(() => setVisible(false), EXIT_DELAY_MS + 650);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(exitTimer);
    };
  }, [persistent, shouldStayVisible]);

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
