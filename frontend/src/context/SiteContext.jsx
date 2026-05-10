import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api.js";
import { fallbackSettings } from "../data/fallback.js";

const SiteContext = createContext(null);

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState(fallbackSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/settings")
      .then(({ data }) => mounted && setSettings({ ...fallbackSettings, ...data }))
      .catch(() => mounted && setSettings(fallbackSettings))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => ({ settings, loading, refreshSettings: () => api.get("/settings").then(({ data }) => setSettings(data)) }), [settings, loading]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export const useSite = () => useContext(SiteContext);
