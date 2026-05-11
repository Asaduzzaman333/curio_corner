import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api.js";
import { fallbackSettings } from "../data/fallback.js";

const SiteContext = createContext(null);

const mergeSettings = (data = {}) => ({
  ...fallbackSettings,
  ...data,
  homepage: { ...fallbackSettings.homepage, ...data.homepage },
  about: { ...fallbackSettings.about, ...data.about },
  contact: { ...fallbackSettings.contact, ...data.contact },
  sections: {
    featured: { ...fallbackSettings.sections.featured, ...data.sections?.featured },
    categories: { ...fallbackSettings.sections.categories, ...data.sections?.categories },
    trending: { ...fallbackSettings.sections.trending, ...data.sections?.trending },
    gallery: { ...fallbackSettings.sections.gallery, ...data.sections?.gallery },
    contact: { ...fallbackSettings.sections.contact, ...data.sections?.contact }
  }
});

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState(fallbackSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/settings")
      .then(({ data }) => mounted && setSettings(mergeSettings(data)))
      .catch(() => mounted && setSettings(fallbackSettings))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => ({ settings, loading, refreshSettings: () => api.get("/settings").then(({ data }) => setSettings(mergeSettings(data))) }), [settings, loading]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export const useSite = () => useContext(SiteContext);
