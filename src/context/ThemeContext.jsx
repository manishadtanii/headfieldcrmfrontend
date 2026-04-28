import { createContext, useContext, useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// ThemeContext — Dark "Midnight" ↔ Light "Pearl"
// Persists to localStorage, applies via data-theme on <html>
// ─────────────────────────────────────────────────────────────────────────────

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('crm-theme') || 'dark'; }
    catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('crm-theme', theme); }
    catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
