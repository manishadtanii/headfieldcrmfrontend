import { useTheme } from '../context/ThemeContext';

// ─────────────────────────────────────────────────────────────────────────────
// useLogo — returns the correct logo path based on current theme
//   Dark  (Graphite) → /images/logo.webp  (colored / standard logo)
//   Light (Pearl)    → /images/logow.png  (white / inverted logo)
// ─────────────────────────────────────────────────────────────────────────────

export function useLogo() {
  const { isDark } = useTheme();
  return isDark ? '/images/logo.webp' : '/images/logow.png';
}
