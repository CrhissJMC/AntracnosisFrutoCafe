import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

// Textos generales y bloques de contenido que usan varias páginas.
const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([api.get('/settings'), api.get('/content')]);
      setSettings(s.settings);
      setItems(c.items);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({
      settings,
      status,
      reload: load,
      section: (name) => items.filter((i) => i.section === name),
    }),
    [settings, items, status, load],
  );
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
